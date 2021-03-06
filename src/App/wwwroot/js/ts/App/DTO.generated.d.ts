﻿





    



// <autogenerated>
//   This file was generated using DTO.tt.
//   Any changes made manually will be lost next time the file is regenerated.
// </autogenerated>



declare module FinancialApp.DTO {

    /** just an empty interface which makes programming the *.tt easier */
    export interface IObject {
    }

    
    

    /** 
* App.Support.Hub.RealtimeSheetEntry
*/

    export interface IRealtimeSheetEntry extends ISheetEntry {
                    /** 
* App.Support.Hub.RealtimeSheetEntry.RealtimeId
*/

            realtimeId : number;

                    /** 
* App.Support.Hub.RealtimeSheetEntry.ConnectionId
*/

            connectionId : string;

                    /** 
* App.Support.Hub.RealtimeSheetEntry.UserName
*/

            userName : string;

            }
    
    

    
    

    /** 
* App.Support.Hub.FinalizeSheetEntry
*/

    export interface IFinalizeSheetEntry extends ISheetEntry {
                    /** 
* App.Support.Hub.FinalizeSheetEntry.RealtimeId
*/

            realtimeId : number;

                    /** 
* App.Support.Hub.FinalizeSheetEntry.Committed
*/

            committed : boolean;

            }
    
    

    
    

    /** 
* App.Models.Domain.Services.SheetGlobalStatistics
*/

    export interface ISheetGlobalStatistics extends IObject {
                    /** 
* App.Models.Domain.Services.SheetGlobalStatistics.TotalExpenses
*/

            totalExpenses : number;

                    /** 
* App.Models.Domain.Services.SheetGlobalStatistics.TotalSavings
*/

            totalSavings : number;

                    /** 
* App.Models.Domain.Services.SheetGlobalStatistics.TotalIncome
*/

            totalIncome : number;

                    /** 
* App.Models.Domain.Services.SheetGlobalStatistics.SheetSubject
*/

            sheetSubject : any;

                    /** 
* App.Models.Domain.Services.SheetGlobalStatistics.CategoryStatistics
*/

            categoryStatistics : ISheetCategoryStatistics[] /*System.Collections.Generic.IEnumerable<App.Models.Domain.Services.SheetCategoryStatistics>*/ ;

            }
    
    

    
    

    /** 
* App.Models.Domain.Services.SheetCategoryStatistics
*/

    export interface ISheetCategoryStatistics extends IObject {
                    /** 
* App.Models.Domain.Services.SheetCategoryStatistics.CategoryName
*/

            categoryName : string;

                    /** 
* App.Models.Domain.Services.SheetCategoryStatistics.Delta
*/

            delta : number;

            }
    
    

    
    

    /** 
* App.Models.Domain.CalculationOptions
*/

    export interface ICalculationOptions extends IObject {
                    /** 
* App.Models.Domain.CalculationOptions.SavingsAccountOffset
*/

            savingsAccountOffset : number;

                    /** 
* App.Models.Domain.CalculationOptions.BankAccountOffset
*/

            bankAccountOffset : number;

            }
    
    

    
    

    /** 
* App.Models.Domain.Category
*/

    export interface ICategory extends IObject {
                    /** 
* App.Models.Domain.Category.Id
*/

            id : number;

                    /** 
* App.Models.Domain.Category.Name
*/

            name : string;

                    /** 
* App.Models.Domain.Category.Description
*/

            description : string;

            }
    
    

    
    

    /** 
* App.Models.DTO.CategoryListing
*/

    export interface ICategoryListing extends IObject {
                    /** 
* App.Models.DTO.CategoryListing.Id
*/

            id : number;

                    /** 
* App.Models.DTO.CategoryListing.Name
*/

            name : string;

                    /** 
* App.Models.DTO.CategoryListing.Description
*/

            description : string;

                    /** 
* App.Models.DTO.CategoryListing.CanBeDeleted
*/

            canBeDeleted : boolean;

            }
    
    

    
    

    /** 
* App.Models.DTO.SheetListing
*/

    export interface ISheetListing extends IObject {
                    /** 
* App.Models.DTO.SheetListing.Month
*/

            month : number;

                    /** 
* App.Models.DTO.SheetListing.Year
*/

            year : number;

                    /** 
* 
Custom name, if set

* 
*/

            name : string;

                    /** 
* App.Models.DTO.SheetListing.UpdateTimestamp
*/

            updateTimestamp : any;

                    /** 
* App.Models.DTO.SheetListing.CreateTimestamp
*/

            createTimestamp : any;

                    /** 
* App.Models.DTO.SheetListing.Totals
*/

            totals : ISheetTotals /* App.Models.DTO.SheetTotals*/ ;

            }
    
    

    
    

    /** 
* App.Models.DTO.SheetTotals
*/

    export interface ISheetTotals extends IObject {
                    /** 
* App.Models.DTO.SheetTotals.SavingsAccount
*/

            savingsAccount : number;

                    /** 
* App.Models.DTO.SheetTotals.BankAccount
*/

            bankAccount : number;

            }
    
    

    
    

    /** 
* App.Models.DTO.RecurringSheetEntry
*/

    export interface IRecurringSheetEntry extends IObject {
                    /** 
* App.Models.DTO.RecurringSheetEntry.Id
*/

            id : number;

                    /** 
* App.Models.DTO.RecurringSheetEntry.CategoryId
*/

            categoryId : number;

                    /** 
* App.Models.DTO.RecurringSheetEntry.Delta
*/

            delta : number;

                    /** 
* App.Models.DTO.RecurringSheetEntry.SortOrder
*/

            sortOrder : number;

                    /** 
* App.Models.DTO.RecurringSheetEntry.Source
*/

            source : string;

                    /** 
* App.Models.DTO.RecurringSheetEntry.Remark
*/

            remark : string;

                    /** 
* App.Models.DTO.RecurringSheetEntry.Account
*/

            account : AccountType;

            }
    
    

    
    

    /** 
* App.Models.DTO.InsertId
*/

    export interface IInsertId extends IObject {
                    /** 
* App.Models.DTO.InsertId.Id
*/

            id : number;

            }
    
    

    
    

    /** 
* App.Models.DTO.AuthenticationInfo
*/

    export interface IAuthenticationInfo extends IObject {
                    /** 
* App.Models.DTO.AuthenticationInfo.IsAuthenticated
*/

            isAuthenticated : boolean;

                    /** 
* App.Models.DTO.AuthenticationInfo.UserId
*/

            userId : number;

                    /** 
* App.Models.DTO.AuthenticationInfo.UserName
*/

            userName : string;

            }
    
    

    
    

    /** 
* App.Models.DTO.SheetEntry
*/

    export interface ISheetEntry extends IObject {
                    /** 
* App.Models.DTO.SheetEntry.Id
*/

            id : number;

                    /** 
* App.Models.DTO.SheetEntry.CategoryId
*/

            categoryId : number;

                    /** 
* App.Models.DTO.SheetEntry.TemplateId
*/

            templateId : number;

                    /** 
* App.Models.DTO.SheetEntry.Delta
*/

            delta : number;

                    /** 
* App.Models.DTO.SheetEntry.Source
*/

            source : string;

                    /** 
* App.Models.DTO.SheetEntry.Remark
*/

            remark : string;

                    /** 
* App.Models.DTO.SheetEntry.SortOrder
*/

            sortOrder : number;

                    /** 
* App.Models.DTO.SheetEntry.UpdateTimestamp
*/

            updateTimestamp : any;

                    /** 
* App.Models.DTO.SheetEntry.CreateTimestamp
*/

            createTimestamp : any;

                    /** 
* App.Models.DTO.SheetEntry.Account
*/

            account : AccountType;

            }
    
    

    
    

    /** 
* App.Models.DTO.RecurringSheetEntryListing
*/

    export interface IRecurringSheetEntryListing extends IObject {
                    /** 
* App.Models.DTO.RecurringSheetEntryListing.Id
*/

            id : number;

                    /** 
* App.Models.DTO.RecurringSheetEntryListing.CategoryId
*/

            categoryId : number;

                    /** 
* App.Models.DTO.RecurringSheetEntryListing.CategoryName
*/

            categoryName : string;

                    /** 
* App.Models.DTO.RecurringSheetEntryListing.SortOrder
*/

            sortOrder : number;

                    /** 
* App.Models.DTO.RecurringSheetEntryListing.Source
*/

            source : string;

                    /** 
* App.Models.DTO.RecurringSheetEntryListing.Account
*/

            account : AccountType;

            }
    
    

    
    

    /** 
* App.Models.DTO.LoginModel
*/

    export interface ILoginModel extends IObject {
                    /** 
* App.Models.DTO.LoginModel.UserName
*/

            userName : string;

                    /** 
* App.Models.DTO.LoginModel.Password
*/

            password : string;

                    /** 
* App.Models.DTO.LoginModel.Persistent
*/

            persistent : boolean;

            }
    
    

    
    

    /** 
* App.Models.DTO.AppUserListing
*/

    export interface IAppUserListing extends IObject {
                    /** 
* App.Models.DTO.AppUserListing.Email
*/

            email : string;

                    /** 
* App.Models.DTO.AppUserListing.UserName
*/

            userName : string;

                    /** 
* App.Models.DTO.AppUserListing.Id
*/

            id : number;

            }
    
    

    
    

    /** 
* App.Models.DTO.AppUserMutate
*/

    export interface IAppUserMutate extends IAppUserListing {
                    /** 
* App.Models.DTO.AppUserMutate.NewPassword
*/

            newPassword : string;

                    /** 
* App.Models.DTO.AppUserMutate.CurrentPassword
*/

            currentPassword : string;

            }
    
    

    
    

    /** 
* App.Models.DTO.Sheet
*/

    export interface ISheet extends IObject {
                    /** 
* App.Models.DTO.Sheet.Id
*/

            id : number;

                    /** 
* App.Models.DTO.Sheet.Subject
*/

            subject : any;

                    /** 
* App.Models.DTO.Sheet.Name
*/

            name : string;

                    /** 
* App.Models.DTO.Sheet.UpdateTimestamp
*/

            updateTimestamp : any;

                    /** 
* App.Models.DTO.Sheet.CreateTimestamp
*/

            createTimestamp : any;

                    /** 
* App.Models.DTO.Sheet.Entries
*/

            entries : ISheetEntry[] /* App.Models.DTO.SheetEntry*/ ;

                    /** 
* App.Models.DTO.Sheet.ApplicableTemplates
*/

            applicableTemplates : IRecurringSheetEntry[] /* App.Models.DTO.RecurringSheetEntry*/ ;

                    /** 
* App.Models.DTO.Sheet.Offset
*/

            offset : ICalculationOptions /* App.Models.Domain.CalculationOptions*/ ;

            }
    
    

    }


