export const generateInviteCode=()=>{
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

    for (let i=0;i<6;i++){
        const random = Math.floor(Math.random()*characters.length)
        result += characters.charAt(random)
    }
    return result
}