﻿namespace App {
    using System;
    using System.Globalization;
    using System.Linq;
    using Api.Extensions;
    using AutoMapper;
    using Microsoft.AspNet.Http;
    using Microsoft.Data.Entity;
    using Microsoft.Extensions.DependencyInjection;
    using Models.Domain;
    using Models.Domain.Identity;
    using Models.Domain.Services;
    using Models.DTO;
    using Sheet = Models.Domain.Sheet;
    using SheetEntry = Models.Domain.SheetEntry;

    public static class AutoMapperEngineFactory {
        public static IMappingEngine Create(IServiceProvider serviceProvider) {
            Mapper.Initialize(x => {
                x.ConstructServicesUsing(serviceProvider.GetRequiredService);
                x.AddGlobalIgnore("Owner");
            });

            Mapper.CreateMap<Category,Category>()
                             .ForMember(x => x.Owner, m=> m.Ignore());

            Mapper.CreateMap<Sheet, Models.DTO.SheetListing>(MemberList.Destination)
                             .ForMember(x => x.Month, x=>x.MapFrom(z=>z.Subject.Month))
                             .ForMember(x => x.Year, x => x.MapFrom(z => z.Subject.Year))
                             .ForMember(x => x.Totals, x => x.MapFrom(z => new SheetTotals {
                                                                                               BankAccount = z.CalculationOptions.BankAccountOffset ?? 0 + z.Entries.Where(e => e.Account == AccountType.BankAccount).Sum(e => e.Delta),
                                                                                               SavingsAccount = z.CalculationOptions.SavingsAccountOffset ?? 0 + z.Entries.Where(e => e.Account == AccountType.SavingsAccount).Sum(e => e.Delta)
                                                                                           }));

            Mapper.CreateMap<Sheet, Models.DTO.Sheet>(MemberList.Destination)
                             .ForMember(x => x.Offset, m => m.ResolveUsing<SheetOffsetCalculationResolver>());

            Mapper.CreateMap<Models.DTO.Sheet, Sheet>(MemberList.Source)
                             .ForSourceMember(x => x.Offset, m=>m.Ignore());

            Mapper.CreateMap<AppUser, AppUserListing>(MemberList.Destination);

            Mapper.CreateMap<SheetEntry, Models.DTO.SheetEntry>(MemberList.Destination)
                .ForMember(x => x.CategoryId, m => m.MapFrom(x => x.Category.Id));

            Mapper.CreateMap<Models.DTO.SheetEntry, SheetEntry>(MemberList.Source)
                .ForMember(x => x.Category, m => m.MapFrom(s => s.CategoryId))
                .ForSourceMember(x => x.CategoryId, m =>m.Ignore()); // TODO: ignore shouldn't be necessary here

            Mapper.CreateMap<int, Category>().ConvertUsing<EntityResolver<Category>>();

            Mapper.AssertConfigurationIsValid();

            return Mapper.Engine;
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        public sealed class EntityResolver<TEntity> : IValueResolver, ITypeConverter<int, TEntity> where TEntity : class, IHasId {
            private readonly HttpContext _httpContext;
            private readonly EntityOwnerService _entityOwnerService;

            private readonly DbSet<TEntity> _entities;

            /// <summary>
            /// Initializes a new instance of the <see cref="T:System.Object"/> class.
            /// </summary>
            public EntityResolver(AppDbContext dbContext, EntityOwnerService entityOwnerService, HttpContext httpContext) {
                this._entityOwnerService = entityOwnerService;
                this._httpContext = httpContext;

                this._entities = dbContext.Set<TEntity>();
            }


            /// <summary>
            /// Implementors use source resolution result to provide a destination resolution result.
            ///             Use the <see cref="T:AutoMapper.ValueResolver`2"/> class for a type-safe version.
            /// </summary>
            /// <param name="source">Source resolution result</param>
            /// <returns>
            /// Result, typically build from the source resolution result
            /// </returns>
            public ResolutionResult Resolve(ResolutionResult source) {
                TEntity entry = this.ResolveCore(source.Value);
                return source.New(entry, typeof(TEntity));
            }

            private TEntity ResolveCore(object sourceValue) {
                int primaryKey = GetPrimaryKey(sourceValue);
                TEntity result = this.FindEntityWithPermissionCheck(primaryKey);
                return result;
            }

            private TEntity FindEntityWithPermissionCheck(int key) {
                TEntity entity = this.FindEntity(key);

                this.VerifyOwnership(entity as IAppOwnerEntity);

                return entity;
            }

            private void VerifyOwnership(IAppOwnerEntity appOwnerEntity) {
                if (appOwnerEntity == null) {
                    return;
                }

                int appOwnerId = GetAppOwnerId(this._httpContext);
                this._entityOwnerService.EnsureOwner(appOwnerEntity, appOwnerId);
            }

            private static int GetAppOwnerId(HttpContext context) {
                return context.User.Identity.GetOwnerGroupId();
            }

            private TEntity FindEntity(int key) {
                return this._entities.FirstOrDefault(x => x.Id == key);
            }

            private static int GetPrimaryKey(object value) {
                IHasId hasId = value as IHasId;
                if (hasId != null) {
                    return hasId.Id;
                }

                try {
                    return System.Convert.ToInt32(value, CultureInfo.InvariantCulture);
                }catch (InvalidCastException ex) {
                    throw new NotSupportedException("Cannot find PK", ex);
                }
            }

            /// <summary>
            /// Performs conversion from source to destination type
            /// </summary>
            /// <param name="context">Resolution context</param>
            /// <returns>
            /// Destination object
            /// </returns>
            public TEntity Convert(ResolutionContext context) {
                return this.ResolveCore(context.SourceValue);
            }
        }

        // ReSharper disable once ClassNeverInstantiated.Local -- It is instantiated, but using DI
        public sealed class SheetOffsetCalculationResolver : ValueResolver<Sheet, CalculationOptions> {
            private readonly SheetOffsetCalculationService _offsetCalculationService;

            public SheetOffsetCalculationResolver(SheetOffsetCalculationService offsetCalculationService) {
                this._offsetCalculationService = offsetCalculationService;
            }

            /// <summary>
            /// Implementors override this method to resolve the destination value based on the provided source value
            /// </summary>
            /// <param name="source">Source value</param>
            /// <returns>
            /// Destination
            /// </returns>
            protected override CalculationOptions ResolveCore(Sheet source) {
                return this._offsetCalculationService.CalculateOffset(source);
            }
        }
    }
}