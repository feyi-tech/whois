const express = require('express');
const whois = require('whois-json');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 1900;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Use CORS to allow requests.
//Server to be deployed at https://whois.feyitech.com
const allowedOrigins = [
  'http://localhost:3000', 
  'https://aidm.feyitech.com', 
  'https://aidomainmaker.com'
];

const corsOptions = {
  origin: allowedOrigins,
};

app.use(cors(corsOptions));

// Define the /check endpoint
app.post('/check', (req, res) => {
  const domainList = req?.body?.domains;

  if (!Array.isArray(domainList)) {
    return res.status(400).json({ error: {
        code: 'invalid_domains_arg',
        message: 'Invalid input. Expected an array of domain names.'
    } });
  }

  const whoisResults = [];

  const sponsored = [
    {
        name: `softbaker.com`,
        tld: "com",
        isAvailable: true,
        isPremium: true,
        premiumPrice: "1,199",
        description: "A domain name ideal for software development company.",
        sponsoredLink: "https://www.namecheap.com/domains/registration/results/?domain=softbaker.com"
    },
    {
        name: `tugofcash.com`,
        tld: "com",
        isAvailable: true,
        isPremium: true,
        premiumPrice: "3999",
        description: "A domain name ideal for a gaming platform. Imagine a game where players can click one of two buttons to tug their money left or right. The higher the amount you deposit on the side you support, the higher the chance of the side winning with you at the end of the game. Money is the strength needed in this game. The side that has the most strength wins, and shares the strength of the other side according to the strength each member of the winning side supplied during the game.",
        sponsoredLink: "https://www.namecheap.com/domains/registration/results/?domain=tugofcash.com"
    },
    {
        name: `meetofflinenow.com`,
        tld: "com",
        isAvailable: true,
        isPremium: true,
        premiumPrice: "299",
        description: "A domain name ideal for a platform where people urgently find the nearest experts around them. Such as urgently getting the nearest, one of the best mechanic by ratings for a suddenly broken car in a town you don't now.",
        sponsoredLink: "https://www.namecheap.com/domains/registration/results/?domain=meetofflinenow.com"
    }
  ]

  var totalDomainsAdded = 0

  // Function to check Whois for a single domain
  async function checkWhois(domain) {
    const nameSegments = domain.split(".")
    const namePart = nameSegments[nameSegments.length - 2].toLowerCase()
    const tld = nameSegments[nameSegments.length - 1].toLowerCase()
    if(whoisResults.length == 0 && sponsored.length > 0) {
        whoisResults.push(sponsored.splice(0, 1)[0])
    }
    try {
        const result = await whois(domain);
        //console.log("result:", result)
        whoisResults.push({
            name: `${namePart}.${tld}`,
            tld: tld,
            isAvailable: !result.domainName,
            isPremium: false
        });
        totalDomainsAdded++;

        if(whoisResults.length % 3 == 0 && sponsored.length > 0) {
            whoisResults.push(sponsored.splice(0, 1)[0])
        }

        if (totalDomainsAdded === domainList.length) {
            res.json(whoisResults);
        }
    } catch (error) {
        whoisResults.push({
            error: error.message,
            name: `${namePart}.${tld}`,
            tld: tld,
            isAvailable: false,
            isPremium: false
        });
        totalDomainsAdded++;

        if (totalDomainsAdded === domainList.length) {
            res.json(whoisResults);
        }
    }
  }

  // Start checking Whois for each domain in parallel
  domainList.forEach((domain) => {
    checkWhois(domain);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});