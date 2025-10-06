const {randomUUID} = require('crypto');
const cron = require('node-cron');


let guest_users = new Map();

async function create_guest(){
    let id = randomUUID();
    if(guest_users.has(id)){
        return null;
    }
    const guest = {
    id,
    type:"guest",
    email:`guest${id}@gmail.com`, 
    username:`Guest ${id}`,
    avatar_url:null,        
    createdAt: new Date().toISOString() 
    };
    guest_users.set(id, guest);
    return guest_users.get(id);
}

async function get_guest(user_uuid){
    if(guest_users.get(user_uuid)){
        return guest_users.get(user_uuid)
    }else{
        return null;
    }
}

async function cleanupGuests() {
  const now = Date.now();
  const oneDay =  60 * 60 * 1000; // 30min in ms

  for (const [id, guest] of guest_users) {
    const createdTime = new Date(guest.createdAt).getTime();
    if (now - createdTime > oneDay) {
      guest_users.delete(id);
      console.log(`Removed guest ${id}, older than 1 day`);
    }
  }

  console.log("Cleanup finished. Remaining guests:", guest_users.size);
}


// cron.schedule('0 0 * * *', cleanupGuests);
cron.schedule('*/60 * * * * *', async()=>{
  try{
    await cleanupGuests();
  }catch(err){
    console.log("cronnerr clean guests: ", err)
  }
}); 
module.exports = {create_guest, get_guest}