public with sharing class ContactListController {

    //Static method for retrieving contacts in the org
    @AuraEnabled (cacheable=true)
    public static List<contactRow> retrieveContacts(){
        List<contactRow> contactRows = new List<contactRow>();
        List<Contact> contacts = [SELECT Id,Name,Email,Phone
                                    FROM Contact
                                    ORDER BY FirstName NULLS LAST];
        if(!contacts.isEmpty()){
            for(Contact c:contacts){
                contactRow contactRow = new contactRow(c);
                contactRows.add(contactRow);
            }
        }
        return contactRows;
    }

    //Inner class for sending the datafrom the database to the client-side.
    public class contactRow{
        @AuraEnabled
        public String name;

        @AuraEnabled
        public String email;

        @AuraEnabled
        public String phone;

        //Constructor based on the contact record
        public contactRow(Contact c){
            this.name = c.name;
            this.email = c.Email;
            this.phone = c.Phone;
        }
    }
}