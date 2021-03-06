﻿/// <init-options route="/sheet/:year/:month"/>
/// <reference path="../../typings/linq/linq.d.ts"/>
/// <reference path="../DTO.generated.d.ts"/>
/// <reference path="../DTOEnum.generated.ts"/>
/// <reference path="../Factories/ResourceFactory.ts"/>
/// <reference path="../Services/SheetTotalCalculationService.ts"/>
/// <reference path="../../typings/angular-ui-bootstrap/angular-ui-bootstrap.d.ts"/>

module FinancialApp {
    'use strict';

    export module DTO {
        export interface ISheetEntry {
            editMode?: boolean;
            isBusy?: boolean;
            isTransient?: boolean;
        }

        export interface ISheet {
            totalSavings: () => number;
            totalBank: () => number;
        }
    }

    export interface ISheetScope extends ng.IScope {
        date: Moment;
        previousDate: Moment;
        isLoaded: boolean;
        sheet: DTO.ISheet;
        categories: DTO.ICategoryListing[];

        unusedTemplates: DTO.IRecurringSheetEntry[];

        expenseTrajectory: Services.ISheetExpenseTrajectory;

        // copy enum
            // ReSharper disable once InconsistentNaming
        AccountType: typeof DTO.AccountType;
            // ReSharper disable once InconsistentNaming
        SortOrderMutation: typeof Factories.SortOrderMutation;

        editEntry: (entry: DTO.ISheetEntry) => void;
        saveEntry: (entry: DTO.ISheetEntry) => void;
        deleteEntry: (entry: DTO.ISheetEntry) => void;
        editRemarks: (entry: DTO.ISheetEntry) => void;
        addEntry: (template?: DTO.IRecurringSheetEntry) => void;
        mutateSortOrder: (entry:DTO.ISheetEntry, mutation: Factories.SortOrderMutation) => void;
    }

    export interface ISheetRouteParams extends ng.route.IRouteParamsService {
        year: string;
        month: string;
    }

    export class SheetController {
        public static $inject = ['$scope', '$routeParams', '$location', '$modal', 'sheetResource', 'sheetEntryResource', 'categoryResource', 'sheetTotalCalculation', 'sheetExpensesCalculation', 'sheetEntryFactory'];

        private isCategoriesLoaded = false;
        private isSheetLoaded = false;

        private year: number;
        private month: number;

        private hubConnection: HubConnection;
        private hub: SheetHub;

        private pushedEntries : IRealtimeSheetEntryInfo[] = [];

        constructor(private $scope: ISheetScope,
                    private $routeParams: ISheetRouteParams,
                    private $location: ng.ILocationService,
                    private $modal : ng.ui.bootstrap.IModalService,
                    private sheetResource: Factories.ISheetWebResourceClass,
                    private sheetEntryResource: Factories.ISheetEntryWebResourceClass,
                            categoryResource: ng.resource.IResourceClass<DTO.ICategoryListing>,
                    private sheetTotalCalculation: Services.SheetTotalCalculationService,
                    private sheetExpensesCalculation : Services.SheetExpensesCalculationService,
                    private sheetEntryFactory : Services.SheetEntryFactory) {

            this.year = parseInt($routeParams.year, 10);
            this.month = parseInt($routeParams.month, 10);

            $scope.date = moment([this.year, this.month - 1 /* zero offset */]);
            $scope.previousDate = moment($scope.date).subtract(1, 'month');
            $scope.isLoaded = false;
            $scope.AccountType = DTO.AccountType; // we need to copy the enum itself, or we won't be able to refer to it in the view
            $scope.SortOrderMutation = Factories.SortOrderMutation; // we need to copy the enum itself, or we won't be able to refer to it in the view
            $scope.unusedTemplates = [];

            // bail out if invalid date is provided (we can do this without checking with the server)
            if (!$scope.date.isValid()) {
                $location.path('/archive');
                return;
            }

            // get data
            $scope.sheet = sheetResource.getByDate({ year: this.year, month: this.month }, (data : DTO.ISheet) => {
                $scope.unusedTemplates = data.applicableTemplates.concat([]);

                this.signalSheetsLoaded(data);
            }, () => $location.path('/archive'));

            $scope.categories = categoryResource.query(() => {
                this.signalCategoriesLoaded();
            });

            $scope.$watchCollection('sheet.entries', (newItems: DTO.ISheetEntry[], removedItems: DTO.ISheetEntry[]) => {
                var templates = this.$scope.unusedTemplates,
                    allTemplates = this.$scope.sheet.applicableTemplates,
                    i: number, arr: DTO.ISheetEntry[], len: number, idx: number;
                
                for (i = 0, arr = newItems || [], len = arr.length; i < len; i++) {
                    idx = Enumerable.from(templates).indexOf(x => x.id === arr[i].templateId);
                    if (idx !== -1) {
                        templates.splice(idx, 1);
                    }
                }

                for (i = 0, arr = removedItems || [], len = arr.length; i < len; i++) {
                    idx = Enumerable.from(allTemplates).indexOf(x => x.id === arr[i].templateId);
                    if (idx !== -1) {
                        templates.push(allTemplates[idx]);
                    }
                }
            });

            $scope.$watch('sheet.entries', () => {
                if (!this.$scope.sheet.offset) {
                    return; // not fully loaded yet
                }

                $scope.expenseTrajectory = this.sheetExpensesCalculation.calculateExpenseTrajectory(this.$scope.sheet);
            }, true);

            $scope.editEntry = (entry) => this.editEntry(entry);
            $scope.saveEntry = (entry) => this.saveEntry(entry);
            $scope.deleteEntry = (entry) => this.deleteEntry(entry);
            $scope.addEntry = (template) => this.addEntry(template);
            $scope.editRemarks = (entry) => this.editRemarks(entry);
            $scope.mutateSortOrder = (entry, mutation) => this.mutateSortOrder(entry, mutation);

            // set-up signal-r
            this.hubConnection = $.hubConnection('/extern/signalr');
            this.hubConnection.logging = true;
            
            $scope.$on('$destroy', () => this.shutdownSignalR());
        }

        private mutateSortOrder(entry: DTO.ISheetEntry, mutation: Factories.SortOrderMutation) {
            var entries = this.$scope.sheet.entries;
            var index = entries.indexOf(entry);
            var newIndex: number = index + mutation;
            if (newIndex < 0 || newIndex >= entries.length) {
                return;
            }

            entry.isBusy = true;
            this.sheetEntryResource.mutateOrder({
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id,
                mutation: Factories.SortOrderMutation[mutation]
            }, {}, () => {
                entries[index] = entries[newIndex];
                entries[newIndex] = entry;
                entry.sortOrder += mutation;
                entry.isBusy = false;
            }, () => entry.isBusy = false);
        }

        private signalSheetsLoaded(sheet : DTO.ISheet) {
            this.isSheetLoaded = true;

            sheet.totalSavings = () => this.sheetTotalCalculation.calculateTotal(sheet, FinancialApp.DTO.AccountType.SavingsAccount);
            sheet.totalBank = () => this.sheetTotalCalculation.calculateTotal(sheet, FinancialApp.DTO.AccountType.BankAccount);

            this.setLoadedBit(sheet);

            this.setupSignalR(this.year + '-' + this.month);
        }

        private signalCategoriesLoaded() {
            this.isCategoriesLoaded = true;
            this.setLoadedBit(this.$scope.sheet);
        }

        private setLoadedBit(sheetData: DTO.ISheet) {
            this.$scope.isLoaded = this.isCategoriesLoaded && this.isSheetLoaded;
        }

        private editRemarks(entry: DTO.ISheetEntry) {
            this.$modal.open({
                templateUrl: '/Angular/Widgets/Sheet-EditRemarks.html',
                controller: RemarksDialogController,
                resolve: {
                    entry: () => entry
                }
            });
        }

        private saveEntry(entry: DTO.ISheetEntry) {
            entry.editMode = false;
            entry.isBusy = true;

            if (!(entry.id > 0)) {
                this.saveAsNewEntry(entry);
                return;
            }

            var params = {
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id
            };

            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.update(params, entry);
            res.$promise.then(() => {
                entry.isBusy = false;
                this.$scope.sheet.updateTimestamp = moment();

                // signal through
                var copy = <IFinalizeRealtimeSheetEntry>$.extend({
                    committed: true
                }, entry);

                this.hub.invoke('finalizeSheetEntry', copy);
            });
            res.$promise['catch'](() => {
                entry.isBusy = false;
                entry.editMode = true;
            });
        }

        private saveAsNewEntry(entry: DTO.ISheetEntry) {
            var params = {
                sheetMonth: this.month,
                sheetYear: this.year
            };

            var res = <ng.resource.IResource<any>> <any> this.sheetEntryResource.save(params, entry);
            res.$promise.then((data) => {
                entry.id = data.id;
                entry.isBusy = false;
                this.$scope.sheet.updateTimestamp = moment();

                // signal through
                var copy = <IFinalizeRealtimeSheetEntry>$.extend({
                    committed: true
                }, entry);
                copy.id = data.id;

                this.hub.invoke('finalizeSheetEntry', copy);
            });
            res.$promise['catch'](() => {
                entry.isBusy = false;
                entry.editMode = true;
            });
        }

        private deleteEntry(entry: DTO.ISheetEntry) {
            var res = ConfirmDialogController.create(this.$modal, {
                title: 'Regel verwijderen',
                bodyText: `Weet je zeker dat je de regel '${entry.source}' wilt verwijderen?`,
                dialogType: DialogType.Danger
            });

            res.result.then(() => this.deleteEntryCore(entry));
        }

        private deleteEntryCore(entry: DTO.ISheetEntry) {
            entry.isBusy = true;
            entry.editMode = false;

            var sendCancellation = () => {
                // signal through
                var copy = <IFinalizeRealtimeSheetEntry>$.extend({
                    committed: false,
                    categoryId : 0
                }, entry);
                copy.id = entry.id;

                this.hub.invoke('finalizeSheetEntry', copy);
            };

            // if the entry has not been saved, we can delete it right away
            if (entry.id == 0) {
                this.$scope.sheet.entries.remove(entry);
                sendCancellation();
                return;
            }

            // server-side delete
            var params = {
                sheetMonth: this.month,
                sheetYear: this.year,
                id: entry.id
            };

            this.sheetEntryResource['delete'](params,
                () => {
                    this.$scope.sheet.entries.remove(entry);
                    this.$scope.sheet.updateTimestamp = moment();

                    sendCancellation();
                },
                () => entry.isBusy = false);
        }

        private addEntry(template ?: DTO.IRecurringSheetEntry): void {
            var newEntry = this.sheetEntryFactory.createEmpty(this.$scope.sheet, template);

            this.$scope.sheet.entries.push(newEntry);

            this.watchEntry(newEntry);
        }

        private editEntry(newEntry: DTO.ISheetEntry): void {
            newEntry.editMode = true;

            this.watchEntry(newEntry);
        }

        private watchEntry(newEntry : DTO.ISheetEntry): void {
            var dispose: Function,
                realtimeId = null,
                isPushing = false;

            dispose = this.$scope.$watchCollection(() => newEntry, () => {
                console.log('Entry change...');

                if (!newEntry.editMode && !newEntry.isBusy) {
                    dispose();
                    return;
                }

                if (realtimeId != null) {
                    newEntry['realtimeId'] = realtimeId;
                }

                var copy = <IRealtimeSheetEntryInfo>$.extend({}, newEntry);

                if (!isPushing) {
                    isPushing = true;

                    this.hub.invoke('addOrUpdatePendingSheetEntry', copy)
                        .done(id => {
                            realtimeId = id;
                        }).always(() => isPushing = false);
                }
            });
        }

        private setupSignalR(sheetId: string) {
            this.hubConnection.qs = {
                sheetId: sheetId
            };

            this.hub = this.hubConnection.createHubProxy('sheetHub');
            this.oneTimeSignalRSetup();

            this.hubConnection.start();
        }

        private shutdownSignalR() {
            if (!this.hubConnection) {
                return;
            }

            this.hubConnection.stop();
        }

        private oneTimeSignalRSetup() {
            this.hub.on('pushSheetEntry', (arg: IRealtimeSheetEntryInfo) => {
                arg.isTransient = true;

                var exists = !!this.pushedEntries[arg.realtimeId];
                this.pushedEntries[arg.realtimeId] = arg;

                var idx;
                if (!exists) {
                    idx = arg.id > 0 ? Enumerable.from(this.$scope.sheet.entries).indexOf(e => e.id === arg.id) : 0;
                } else {
                    idx = Enumerable.from(this.$scope.sheet.entries).indexOf(e => isTransientEntry(e) && e.realtimeId === arg.realtimeId);
                }

                if (idx !== -1) {
                    this.$scope.sheet.entries[idx] = arg;
                } else {
                    this.pushAndSort(arg);
                }

                this.$scope.$apply();
            });

            this.hub.on('finalizeRealtimeSheetEntry', (arg: IFinalizeRealtimeSheetEntry) => {
                delete this.pushedEntries[arg.realtimeId];
                this.$scope.sheet.entries.remove(Enumerable.from(this.$scope.sheet.entries).firstOrDefault(x => isTransientEntry(x) && x.realtimeId === arg.realtimeId));

                if (arg.committed) {
                    this.sheetEntryResource.get({
                        sheetYear: this.$routeParams.year,
                        sheetMonth: this.$routeParams.month,
                        id: arg.id
                    }, e => {
                        this.pushAndSort(e);
                        this.$scope.$apply();
                    });
                }

                this.$scope.$apply();
            });
        }

        private pushAndSort(arg : DTO.ISheetEntry) {
            this.$scope.sheet.entries.push(arg);
            this.$scope.sheet.entries.sort((a, b) => a.sortOrder - b.sortOrder);
        }
    }

    function isTransientEntry(input: DTO.ISheetEntry) : input is IRealtimeSheetEntryInfo {
        return input.isTransient === true;
    }

    interface IRemarksDialogControllerScope extends ng.IScope {
        entry: DTO.ISheetEntry;
        originalRemarks: string;

        saveChanges: IAction;
        cancel: IAction;
    }

    class RemarksDialogController {
        public static $inject = ['$scope', '$modalInstance', 'entry'];

        constructor(private $scope: IRemarksDialogControllerScope, $modalInstance : ng.ui.bootstrap.IModalServiceInstance, entry : DTO.ISheetEntry) {
            $scope.entry = entry;
            $scope.originalRemarks = entry.remark;

            $scope.saveChanges = () => $modalInstance.close();

            $scope.cancel = () => {
                $scope.entry.remark = $scope.originalRemarks;
                $modalInstance.dismiss();
            };
        }
    }
}