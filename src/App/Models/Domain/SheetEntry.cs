﻿namespace App.Models.Domain {
    using System;
    using System.ComponentModel.DataAnnotations;
    using Repositories;
    using Services;

    [GenerateRepository]
    public class SheetEntry : IHasId, IHasSortOrder {
        public int Id { get; set; }

        [Required]
        public virtual Category Category { get; set; }

        [Required]
        public virtual Sheet Sheet { get; set; }

        public decimal Delta { get; set; }

        [StringLength(250)]
        public string Source { get; set; }
        public string Remark { get; set; }

        public int SortOrder { get; set; }

        public DateTime UpdateTimestamp { get; set; }

        public DateTime CreateTimestamp { get; set; }

        public AccountType Account { get; set; }

        public virtual RecurringSheetEntry Template { get;set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:System.Object"/> class.
        /// </summary>
        public SheetEntry() {
            this.CreateTimestamp = DateTime.Now;
            this.UpdateTimestamp = DateTime.Now;
        }
    }
}