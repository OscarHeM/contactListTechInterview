@isTest
public with sharing class ContactListControllerTest {

    @isTest
    public static void retrieveContactsTest(){
        List<Contact> contactsToInsert = new List<Contact>();
        for(Integer i=0;i<3;i++){
            Contact c = new Contact(
                FirstName = 'Test',
                LastName = 'Contact'+i,
                Phone = '354681371'+i,
                Email = 'test'+i+'@fakemail.com'
            );
            contactsToInsert.add(c);
        }
        insert contactsToInsert;
        List<ContactListController.contactRow> contactRows = new List<ContactListController.contactRow>();
        Test.startTest();
            contactRows = ContactListController.retrieveContacts();
        Test.stopTest();
        System.assertEquals(3, contactRows.size());
    }
}