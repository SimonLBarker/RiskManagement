
const cds = require('@sap/cds')

/**
 * Implementation for Risk Management service defined in ./risk-service.cds
 */
module.exports = cds.service.impl(async function() {

    const { Risks, BusinessPartners } = this.entities;
   
    this.after('READ', 'Risks', risksData => {
        const risks = Array.isArray(risksData) ? risksData : [risksData];
        risks.forEach(risk => {
            if (risk.impact >= 100000) {
                risk.criticality = 1;
            } else {
                risk.criticality = 2;
            }
        });
    });



    // connect to the remote service
    const BPsrv = await cds.connect.to("API_BUSINESS_PARTNER");

    /**
     * Event handler for read-events on the BusinessPartners entity.
     * Each rerquest to the API Business Hub requirred the apiKey in the header
     */

     this.on("READ", BusinessPartners, async (req) => {
         req.query.where("LastName <> '' and FirstName  <> '' ");

         return await BPsrv.transaction(req).send({
             query: req.query, 
             headers: {
                 apiKey: process.env.apiKey,
             }
         })
     })


    this.on("READ", 'Risks', async (req, next) => { 

    try {
        const res = await next();
        await Promise.all(
            res.map(async (risk) => {
                const bp = await BPsrv.transaction(req).send({
                    query: SELECT.one(this.entities.BusinessPartners)
                    .where({ BusinessPartner: risk.bp_BusinessPartner})
                    .columns(["BusinessPartner", "LastName", "FirstName"]),
                    headers: {
                        apikey: process.env.apiKey,
                    },
                });
                risk.bp = bp;
            })
        );
    } catch (error) {}
});
});

