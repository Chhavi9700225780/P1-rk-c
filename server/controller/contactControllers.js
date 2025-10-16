// Import the sendEmail utility function from the specified path
const sendEmail = require("../utils/sendEmail");

// Define an asynchronous function to handle the contact form submission
const contact = async (req, res) => {
  try {
     // Extract the name, email, and message from the request body
    const { name, email, message } = req.body;
    
    // Create an object to hold the extracted data
    const data = {
      name: name,
      email: email,
      message: message,
      subject: "Query Received",
    };

    // Log the extracted data for debugging purposes
    // console.log(data);

   // Configure options for sending confirmation emails to the sender and website owner
    let options = {
    data : {
     name: data.name,
      email: data.email,
      message: data.message
    },

      subject: "Query Received",
      message_Content:
        "<p> Hi " +
        data.name +
        ",<br />Thanks for raising query. I have Received your query. I will contact to you as soon as possible within 24-48 Hours.  <br /> <b>Regards</b> <br> Chhavi </p> ",
    };

     //   sending the confirmation to sender person
    const emailres=await sendEmail(data);
    if(emailres=="success")
    {
      return res.status(200).json({success:'true',msg:"hi"});
    }

    // Configure options for sending notification email to the website owner
   // options = {
  //    name: data.name,
  //    email: SMPT_MAIL,
  //    subject: "New Query from Bhagavad Gita Website",
  //    message_Content: `<p> Chhavi, <br> You have received a new query from your Bhagavad Gita Website. The Sender Details are: <br> <b>Name : </b>${data.name} <br> <b>Email : </b> ${data.email} <br> <b>Message : </b> ${data.message} </p>`,
  //  };
    
     // Send the notification email to the website owner
   // await sendEmail(options);

    // Respond with a success status and message
    res.status(201).json({
      success: true,
      message: "message sent to both parties",
    });
  } catch (error) {
    // If an error occurs, respond with an error status and message
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Export the contact function for use in other parts of the application
module.exports = {
  contact,
};