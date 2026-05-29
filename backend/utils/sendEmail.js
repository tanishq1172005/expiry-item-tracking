import {Resend} from "resend"
import dotenv from 'dotenv'

dotenv.config({
    path:'../.env'
})


export const sendEmail = async(to,username,items) => {
    try{
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.EMAIL_FROM
        const itemList = items.map(item=>{
            `<li>
            ${item.name} ${item.category}
            - expires on ${new Date(item.expiryDate).toDateString()}
            </li>`
        }).join('')
        const response = await resend.emails.send({
            from,
            to,
            subject:"Items expiring soon",
            html:`<h2>Hello ${username},</h2>

        <p>The following items are expiring within 24 hours:</p>

        <ul>
          ${itemList}
        </ul>

        <p>Please use them soon to reduce waste.</p>
      `
        }) 

        console.log("Email sent",response.data?.id)

    }catch(err){
        console.error("Error:",err)
    } 
}