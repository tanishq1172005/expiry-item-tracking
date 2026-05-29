import cron from 'node-cron'
import { Item } from '../models/itemModel.js'
import { Household } from '../models/householdModel.js'
import { sendEmail } from './sendEmail.js'

export const checkExpiry = ()=>{
    cron.schedule('0 8 * * *',
    async()=>{
        try{
            console.log("running expiry check cron job")

            const now = new Date()

            const tommorow = new Date(
                now.getTime() + 24*60*60*1000
            )

            const expiringItems = await Item.find({
                expiryDate:{
                    $gte: now,
                    $lte: tommorow
                },status:{
                    $nin: ['used','wasted','expired']
                }
            }).populate('householdId')
            
            const householdMap = {}

            for(const item of expiringItems){
                const householdId = item.householdId._id.toString()

                if(!householdMap[householdId]){
                    householdMap[householdId]=[]
                }
                householdMap[householdId].push(item)
            }

            for (const householdId in householdMap) {
                const household = await Household.findById(
                householdId
                ).populate('members')
            }

            const items = householdMap[householdId];

        for (const member of household.members) {
                await sendEmail({
                to: member.email,
                username: member.name,
                items,
                });
            }
            console.log("Expiry email sent")
        }catch(err){
            console.error("Cron job failed",err)
        }
    })
}