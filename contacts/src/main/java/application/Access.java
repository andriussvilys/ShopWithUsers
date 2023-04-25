package application;

import java.util.ArrayList;
import java.util.List;

public class Access {

    private static ArrayList<Contact> contactList;

    public static void initContacts() {
        contactList = new ArrayList<Contact>();
        contactList.add(new Contact(12345, "Vangogh", "Jake", "+37065841738", "jakevan@mail.com"));
        contactList.add(new Contact(74638, "Dirk", "Mike", "+37064787734", "mikedirk@mail.com"));
        contactList.add(new Contact(87014, "Davis", "Luke", "+37064787735", "davisluke@mail.com"));
        contactList.add(new Contact(11234, "Mer", "Eva", "+37064787737", "EvaMer@mail.com"));
    }

    public List<Contact> getAllContacts(){
         if(contactList == null)
             initContacts();

             return contactList;
    }

    public Contact getContact(int id){
        if(contactList == null)
            initContacts();
        for(Contact contact : contactList){
            if(contact.getId() == id) return contact;
        }
        return null;
    }

    public int addContact(Contact nContact) {
        if(contactList == null)
            initContacts();

        for (Contact contact : contactList) {
            if (contact.equals(nContact) || contact.getId() == nContact.getId() || contact.getNumber() == nContact.getName()) {
                return 0;
            }

        }

        if (nContact.getId() == 0 || nContact.getName() == null || nContact.getNumber() == null || nContact.getSurname() == null || nContact.getEmail() == null) {
            return 2;
        }

        contactList.add(nContact);
        return 1;
    }

    public int updateContact(int oId, Contact uContact){

        if(contactList == null)
            initContacts();

        if (uContact.getName() == null || uContact.getNumber() == null || uContact.getSurname() == null || uContact.getEmail() == null) {
            return 2;
        }

        for(Contact contact : contactList) {
            if(contact.getId() == uContact.getId()){
                return 3;
            }
        }

        if(uContact.getId() == 0)
            uContact.setId(oId);
        for(Contact contact : contactList){
            if(contact.getId() == oId){
                int index = contactList.indexOf(contact);
                contactList.set(index, uContact);
                return 1;
            }
        }

        return 0;
    }

    public int deleteContact(int id){

        if(contactList == null)
            initContacts();

        for(Contact contact : contactList){
            if(contact.getId() == id){
                contactList.remove(contact);
                return 1;
            }
        }
        return 0;
    }

}
