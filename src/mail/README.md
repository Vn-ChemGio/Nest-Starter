
# Send Email Service Document

This Document guide you how to send an email with custom or with template with via two System Email Server is SendGrid and SMTP (like GoogleMail)



## Send via SendGrid

```javascript
export class YourClass {
  constructor(private readonly mailService: MailService)

  public function yourFunction (){
    ... 
    /* #Send with raw data */
      const data = {
        from: 'info@vn01.tk', // Use the email address or domain you verified above
        subject: 'Welcome to Nestjs Sample',
        to: 'vn.chemgio@yahoo.com', // Change to your recipient
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
      this.mailService.sendGridSendEmail(data)
    ...

    /* #Send with template */
      const data = {
      from: {
        email: 'info@vn01.tk',
      },
      personalizations: [
        {
          to: [
            {
              email: 'vn.chemgio@yahoo.com',
            },
          ],
          dynamicTemplateData: {
           ... dataForRender
          },
        },
      ],
      templateId: 'd-e3cf91ed07e44fbca4892172746a82eb',
    }
     this.mailService.sendGridSendEmail(data)
    ...
  }
}
```


## Send via STMP

```javascript

export class YourClass {
  constructor(private readonly mailService: MailService)

  public function yourFunction (){
    ... 
    #Send with temlate in db
     
      this.mailService.sendSMTPEmailFromDb( "id of template in db","vn.chemgio@yahoo.com",
      {
        username: "Any",
        ...
      })
    ...

    #Send with template file
      this.mailService.sendSMTPEmailFromTemplate("welcome","vn.chemgio@yahoo.com", 'Welcome to my website', {
        username: "Any",
        ...
      })
    ...
  }
}
```

