package application;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import javax.validation.Valid;

@RestController
public class Controller {
    Access contactAccess = new Access();

    @RequestMapping(value = "/contacts", method = RequestMethod.GET)
    public ResponseEntity<List<Contact>> getContacts(){
        List<Contact> contactList = contactAccess.getAllContacts();
        if(contactList.isEmpty()) return new ResponseEntity<List<Contact>>(contactList, HttpStatus.NO_CONTENT);
        else return new ResponseEntity<List<Contact>>(contactList, HttpStatus.OK);
    }

    @RequestMapping(value = "/contacts/{id}", method = RequestMethod.GET)
    public ResponseEntity<Contact> getContact(@PathVariable(value="id") int id){
        Contact contact = contactAccess.getContact(id);
        if(contact == null) return new ResponseEntity<Contact>(contact, HttpStatus.NOT_FOUND);
        return new ResponseEntity<Contact>(contact, HttpStatus.OK);
    }

    @RequestMapping(value = "/contacts", method = RequestMethod.POST)
    public ResponseEntity<String> addContact(@Valid @RequestBody Contact contact, UriComponentsBuilder b){
        int response = contactAccess.addContact(contact);

        List<Contact> list = contactAccess.getAllContacts();
        Contact element = list.get(list.size() - 1);
        HttpHeaders headers = headerBuilder(b, element.getId());

        if(response == 1) return new ResponseEntity<String>("Contact added successfully.", headers, HttpStatus.CREATED);
        else if(response == 2) return new ResponseEntity<String>("Failed. Wrong data.", headers, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<String>("Failed. Contact already exists.", headers, HttpStatus.BAD_REQUEST);
    }

    @RequestMapping(value = "/contacts/{id}", method = RequestMethod.PUT)
    public ResponseEntity<String> updateContact(@PathVariable(value="id") int oid, @Valid @RequestBody Contact contact, UriComponentsBuilder b){
        if(contactAccess.getContact(oid) != null){
            int response = contactAccess.updateContact(oid, contact);
            Contact element;
            HttpHeaders headers;
            if(contact.getId() == 0){
                element = contactAccess.getContact(oid);
            }
            else{
                element = contactAccess.getContact(contact.getId());
            }
            headers = headerBuilder(b, element.getId());
            if(response == 1)
             return new ResponseEntity<String>("Contact updated successfully.", headers, HttpStatus.OK);
            else if(response == 3)
                return new ResponseEntity<String>("Failed. New id already exists.", headers, HttpStatus.BAD_REQUEST);
            else
                return new ResponseEntity<String>("Failed. Wrong data.", headers, HttpStatus.BAD_REQUEST);

        }
        else return new ResponseEntity<String>("Failed. Could not find contact.", HttpStatus.NOT_FOUND);
    }


    @RequestMapping(value = "/contacts/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<String> deleteContact(@PathVariable(value="id") int id){
        int response = contactAccess.deleteContact(id);
        if(response == 1) return new ResponseEntity<String>("Contact deleted successfully.", HttpStatus.OK);
        return new ResponseEntity<String>("Failed. Could not find contact.", HttpStatus.NOT_FOUND);
    }

    public HttpHeaders headerBuilder(UriComponentsBuilder b, int id){
        UriComponents uriComponents = b.path("/contacts/{id}").buildAndExpand(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(uriComponents.toUri());
        return headers;
    }
}
