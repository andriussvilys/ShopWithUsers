package application;



public class Contact {

    private int id;
    private String surname;
    private String name;
    private String number;
    private String email;

    public Contact(){}

    public Contact(Integer id, String surname, String name, String number, String email){
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.number = number;
        this.email = email;
    }

    public void setId(int id){
        this.id = id;
    }

    public void setSurname(String surname){
        this.surname = surname;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setNumber(String number){
        this.number = number;
    }

    public void setEmail(String email){

        this.email = email;
    }

    public int getId(){
        return id;
    }

    public String getSurname(){
        return surname;
    }

    public String getName(){
        return name;
    }

    public String getNumber(){
        return number;
    }

    public String getEmail(){
        return email;
    }



    public boolean equals(Contact contact){
        if(contact == null) return false;
        else{
            if(surname.equals(contact.getSurname()) && name.equals(contact.getName()) && number.equals(contact.getNumber())) return true;
        }
        return false;
    }

}
