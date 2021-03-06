﻿namespace App.Support.Integration {
    using System;
    using System.IO;
    using System.Net;
    using System.Text;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Http.Headers;
    using Microsoft.Extensions.FileProviders;
    using Microsoft.Extensions.Logging;
    using Microsoft.Net.Http.Headers;

    public sealed class ApplicationCacheMiddleware {
        private readonly RequestDelegate _next;
        private readonly IStaticFileUrlGenerator _urlGenerator;
        private readonly ILogger _logger;
        private readonly IFileProvider _fileProvider;
        private readonly IAppVersionService _appVersion;

        private static readonly Regex AppViewDirective = new Regex(
            @"^\/Angular\/(?<first>[A-z./]+)\.html(\s\/Angular\/(?<second>[A-z./]+)\.html)?$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.Singleline);

        private string _appCacheManifest;
        private EntityTagHeaderValue _eTag;
        private DateTime _lastModifiedTime;

        public ApplicationCacheMiddleware(RequestDelegate next, ILoggerFactory loggerFactory, IHostingEnvironment hostingEnv, IStaticFileUrlGenerator urlGenerator, IAppVersionService appVersion) {
            this._next = next;
            this._urlGenerator = urlGenerator;
            this._appVersion = appVersion;
            this._fileProvider = hostingEnv.WebRootFileProvider;
            this._logger = loggerFactory.CreateLogger<ApplicationCacheMiddleware>();
        }

        public async Task Invoke(HttpContext context) {
            this._logger.LogInformation("Handling appcache request");
            this.InitAppCacheInfoIfRequired();
            
            // response headers
            HttpResponse response = context.Response;
            response.ContentType = "text/cache-manifest";

            // ... set cache
            ResponseHeaders headers = response.GetTypedHeaders();

            CacheControlHeaderValue cache = headers.CacheControl ?? (headers.CacheControl = new CacheControlHeaderValue());
            cache.Private = true;
            
            headers.ETag = this._eTag;
            headers.LastModified = this._lastModifiedTime;
            
            // output app cache
            using (StreamWriter sw = new StreamWriter(context.Response.Body, Encoding.UTF8)) {
                await sw.WriteAsync(this._appCacheManifest);
            }
        }

        private void InitAppCacheInfoIfRequired() {
            if (this._appCacheManifest == null) {
                this._logger.LogInformation("Initializing one-time application cache");

                this.InitAppCacheInfo();
            }
        }

        /// <summary>
        /// Initializes the underlying application cache
        /// </summary>
        /// <remarks>
        /// Threading notice: It is entirely possible this code
        /// may run multiple times, even due to locality of the
        /// <see cref="_appCacheManifest"/> variable but we don't
        /// care. Eventually this method won't run.
        /// </remarks>
        private void InitAppCacheInfo() {
            StringBuilder appCacheManifestBuilder = new StringBuilder();
            DateTime lastModified = DateTime.MinValue;
            string etag = null;

            using (StreamReader reader = this.CreateAppCacheManifestReader()) {
                string line;

                while ((line = reader.ReadLine()) != null) {
                    int index;
                    Match match;
                    if ((index = line.IndexOf("{version}", StringComparison.OrdinalIgnoreCase)) != -1) {
                        line = line.Substring(0, index) + this._appVersion.GetVersion() + line.Substring(index + "{version}".Length);
                    } else if ((line.IndexOf("/build", StringComparison.OrdinalIgnoreCase)) == 0) {
                        line = this._urlGenerator.GenerateUrl(line);
                    } else if ((match = AppViewDirective.Match(line)).Success) {
                        line = MakeViewUrl(match.Groups["first"].Value);
                        this.UpdateCacheInfo(Path.Combine("Angular/", match.Groups["first"].Value) + ".html", ref etag, ref lastModified);

                        Group secondGroup;
                        if ((secondGroup = match.Groups["second"]) != null && secondGroup.Success) {
                            line += " " + MakeViewUrl(secondGroup.Value);
                            this.UpdateCacheInfo(Path.Combine("Angular/", match.Groups["second"].Value) + ".html" , ref etag, ref lastModified);
                        }
                    }

                    appCacheManifestBuilder.AppendLine(line);
                }
            }

            // set locals
            this._appCacheManifest = appCacheManifestBuilder.ToString();
            this._eTag = new EntityTagHeaderValue('"' + etag + '"');
            this._lastModifiedTime = lastModified;
        }

        private void UpdateCacheInfo(string path, ref string etag, ref DateTime lastModified) {
            IFileInfo fileInfo = this._fileProvider.GetFileInfo(path);

            this._logger.LogDebug("Updating cache info via path {0}", path);
            if (!fileInfo.Exists) {
                this._logger.LogWarning("Error while creating cache info for manifest: File {0} does not exist", path);
                return;
            }

            etag = etag + fileInfo.LastModified.GetHashCode().ToString("x2");
            lastModified = lastModified == DateTime.MinValue || fileInfo.LastModified > lastModified ? fileInfo.LastModified.UtcDateTime : lastModified;

        }

        private string MakeViewUrl(string relativeFilePathWithoutExtension) {
            return "/Angular/" + relativeFilePathWithoutExtension + ".html?v=" + this._appVersion.GetVersionIdentifier();
        }

        private StreamReader CreateAppCacheManifestReader() {
            Stream stream = this._fileProvider.GetFileInfo("application.appcache")?.CreateReadStream();

            if (stream == null) {
                this._logger.LogError("Unable to find application file cache file.");
                throw new InvalidOperationException();
            }

            return new StreamReader(stream);
        }
    }
}