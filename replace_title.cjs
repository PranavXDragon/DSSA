const fs = require('fs');
const file = 'a:/ready/landing page/index.html';
let data = fs.readFileSync(file, 'utf8');

// Replace Title
data = data.replace('<title>Landing Page</title>', '<title>DSSA</title>');

// Replace OG Titles
data = data.replace(/content="Active Theory · Creative Digital Experiences"/g, 'content="DSSA"');
data = data.replace(/content="Active Theory"/g, 'content="DSSA"');

// Replace Description
const oldDesc = "Founded in 2012. We blend story, art & technology as an in-house team of passionate makers. Our industry-leading web toolset consistently delivers award-winning work through quality & performance. ";
const newDesc = "The Data Science Student Association (DSSA) is the official student-led technical community dedicated to empowering students through innovation, collaboration, and continuous learning in Data Science, Artificial Intelligence, Machine Learning, and emerging technologies. We create opportunities for students to explore beyond the classroom through hands-on workshops, hackathons, industry sessions, technical events, research initiatives, and real-world projects. At DSSA, we believe in learning by building, solving real problems, and growing together as a community that prepares future technology leaders.";

data = data.replace(new RegExp(oldDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newDesc);

fs.writeFileSync(file, data);
console.log('Updated index.html titles and descriptions to DSSA!');
