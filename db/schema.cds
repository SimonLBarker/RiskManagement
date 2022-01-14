namespace riskmanagement;
using { managed } from '@sap/cds/common';
entity Risks : managed {
    key ID      : UUID @(Core.Computed : true);
    title       : String(100);
    owner       : String;
    prio        : String(5);
    descr       : String;
    miti        : Association to Mitigations;
    impact      : Integer;
    bp          : Association to BusinessPartners;   
    criticality : Integer;
}


entity Mitigations : managed {
    key ID      : UUID @(Core.Computed : true);
    descr       : String;
    owner       : String; 
    timeline    : String;
    Risks       : Association to many Risks on Risks.miti = $self;
}

using { API_BUSINESS_PARTNER as extenal} from '../srv/external/API_BUSINESS_PARTNER.csn';

entity BusinessPartners as projection on extenal.A_BusinessPartner {
    key BusinessPartner,
    LastName,
    FirstName
}