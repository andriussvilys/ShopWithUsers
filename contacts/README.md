# Contacts

Launching Web Service:

1. Clone git repository:
```git clone https://github.com/augkik/contacts.git```
2. Create docker image:
```docker build -f Dockerfile -t app .```
3. Run container:
```docker run -p 5000:5000 app```

Instructions:

GET 

List of all contacts:
```/contacts```

Contact with particular id:
```/contacts/<id>```

PUT

Update particular contact: ```/contacts/<id>```

DELETE

Remove particular contact: ```/contacts/<id>```

POST

Add new contact: ```/contacts```
