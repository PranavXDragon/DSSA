const fs = require('fs');
const file = 'public/assets/js/app.1746999829739.js';
let data = fs.readFileSync(file, 'utf8');
const regex = /_this\.onInit=function\(\)\{.*?\}/;
const newCode = '_this.onInit=function(){if(window.CMS_MENU_DATA){_this.addMessage(window.CMS_MENU_DATA.title,"#f4f4f4",!0);window.CMS_MENU_DATA.items.forEach((item,i)=>{_this.addFilter(item.label,item.tag,!0,(i+1)*100)})}else{_this.addMessage("What are you looking for?","#f4f4f4",!0);_this.addFilter("-> websites","Website",!0,100)}}';
data = data.replace(regex, newCode);
fs.writeFileSync(file, data);
console.log('Successfully replaced onInit!');
