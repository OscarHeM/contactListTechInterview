import { LightningElement,api,wire,track } from 'lwc';
import retrieveContacts from '@salesforce/apex/ContactListController.retrieveContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Name', fieldName: 'name', sortable: "true"},
    { label: 'Email', fieldName: 'email', type: 'email',sortable: "true"},
    { label: 'Phone', fieldName: 'phone', type: 'phone',sortable: "true"},
];

export default class ContactList extends LightningElement {

    get pageOptions() {
        return [
            { label: '5', value: '5' },
            { label: '10', value: '10' },
            { label: '20', value: '20' },
        ];
    }

    @track value = '5';
    @track error;
    @track data;
    @api sortedDirection = 'asc';
    @api sortedBy = 'name';
    @api searchKey = '';
    @track page = 1; 
    @track items = []; 
    @track data = []; 
    @track columns; 
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 5; 
    @track totalRecountCount = 0;
    @track totalPage = 0;
    isPageChanged = false;
    @track initialLoad = false;
    @track showTable;

    //Initial record retrieval for rendering
    @wire(retrieveContacts)
    wiredContactLst({error, data}){
        if(data){
            this.processRecords(data);
            this.contactData = data;
            this.totalContacts = this.contactData.length;
            this.error = undefined;
            this.initialLoad = true; //For showing a spinner in case the record retrieval takes longer than expected
            this.showToast('Success','Contacts loaded successfully','success');
        } else if(error){
            this.error = error;
            this.contactData = undefined;
            this.showToast('Unexpected Error','Please contact your Administrator. Sorry for your trouble.','error');
        }
    }

    //Toast message launcher for successful rendering and error handling
    showToast(title,message,variant) {
        const e = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'pester'
        });
        this.dispatchEvent(e);
    }

    //changing the number of records shown per page
    handleChange(event) {
        this.value = event.detail.value;
        this.pageSize = this.value;
        this.processRecords(this.items);
        this.page = 1;
        this.displayRecordPerPage(this.page);
    }
  
    //Data processing for displaying the data in the table and the number of pages. Main rendering method
    processRecords(data){
        this.items = data;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            this.data = data.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
            this.showTable = true;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        this.isPageChanged = true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 
        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }  

    //Method fires when the sorting option is clicked
    sortColumns(event){
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortData(this.sortedBy,this.sortedDirection)
        
    }

    //Handles the sorting thurough the 'sort' method in an array
    sortData(fieldname, direction){
        let parseData = JSON.parse(JSON.stringify(this.contactData));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        console.log(keyValue);
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            console.log('xxx: ',x);
            console.log('yyy:', y);
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.processRecords(parseData);
    }

    //Looks for matches in the contacts name (Case insensitive). In case there is no match, a message will be displayed instead of the table
    handleKeyChange(event) {
        this.searchKey = event.target.value;
        var data = [];
        for(var i=0; i<this.contactData.length;i++){
            if(this.contactData[i]!= undefined && this.contactData[i].name?.toUpperCase().includes(this.searchKey.toUpperCase())){
                data.push(this.contactData[i]);
            }
        }
        this.processRecords(data);
        if(data.length == 0){
            this.showTable = false;
        }
    }
}