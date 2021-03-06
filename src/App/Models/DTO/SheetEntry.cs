﻿namespace App.Models.DTO {
    using System;
    using System.Runtime.Serialization;
    using Domain.Services;

    [DataContract]
    public class SheetEntry : IHasSortOrder {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public int CategoryId { get; set; }

        [DataMember]
        public int? TemplateId { get; set; }

        [DataMember]
        public decimal Delta { get; set; }

        [DataMember]
        public string Source { get; set; }

        [DataMember]
        public string Remark { get; set; }

        [DataMember]
        public int SortOrder { get; set; }

        [DataMember]
        public DateTime UpdateTimestamp { get; set; }

        [DataMember]
        public DateTime CreateTimestamp { get; set; }

        [DataMember]
        public AccountType Account { get; set; }
    }
}