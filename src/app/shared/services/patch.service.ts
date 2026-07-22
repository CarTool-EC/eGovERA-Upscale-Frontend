import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatchService {
    private dbcRelations = {
        "http://data.europa.eu/dr8/egovera/TaxPlanningCapability": [
            "http://data.europa.eu/dr8/egovera/TaxCalendarBusinessService", 
            "http://data.europa.eu/dr8/egovera/AdvanceTaxRulingBusinessService", 
            "http://data.europa.eu/dr8/egovera/MyTaxesBusinessService",
            "http://data.europa.eu/dr8/egovera/IntangibleAssetsRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForMobileAssetsBusinessService",
            "http://data.europa.eu/dr8/egovera/FinancialFlowsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForPropertiesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability": [
            "http://data.europa.eu/dr8/egovera/TaxCalendarBusinessService", 
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/MyTaxesBusinessService",
            "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/ValueAddedTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-DiligenceManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxReturnsControlBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability": [
            "http://data.europa.eu/dr8/egovera/AdvanceTaxRulingBusinessService", 
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPrivateCompaniesBusinessService", 
            "http://data.europa.eu/dr8/egovera/MyTaxesBusinessService",
            "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPublicAdministrationsBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxReturnsControlBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/RevenueFeeCollectionForRegularAndSpecialCasesCapability": [
            "http://data.europa.eu/dr8/egovera/EnvironmentalTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/RevenueTrackingAndAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/HeritagesAndRentingsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/BankinngAccountsMonitoringBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability": [
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPrivateCompaniesBusinessService", 
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-DiligenceManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService",
            "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/EconomicEventsMonitoringCapability": [
            "http://data.europa.eu/dr8/egovera/EconomicActivityCodesRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/Anti-fraudManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/Macro-economicFrameworkBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability": [
            "http://data.europa.eu/dr8/egovera/EconomicActivityCodesRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/LoansAndMortgagesRegistryManagmenetBusinessService",
            "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/DisputeRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxProfessionalsAndAgentsRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPublicAdministrationsBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService",
            "http://data.europa.eu/dr8/egovera/FiscalProfessionsAndQualificationsRegistryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/InternationalTaxManagementCapability": [
            "http://data.europa.eu/dr8/egovera/Cross-borderEUClaimsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/ThirdCountriesClaimsRecoveryBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/InternationalTaxInformationCollectionCapability": [
            "http://data.europa.eu/dr8/egovera/Cross-borderEUClaimsManagementBusinessService", 
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxHistoricalSeriesAnalysisAndTaxCasesManagementCapability": [
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/InternalInspectionAndAuditingCapability": [
            "http://data.europa.eu/dr8/egovera/Anti-fraudManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/InternalAuditingBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/InspectionAndAuditingCapability": [
            "http://data.europa.eu/dr8/egovera/Anti-fraudManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/InternalAuditingBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxStudiesAndResearchCapability": [
            "http://data.europa.eu/dr8/egovera/PartrimonyAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/RevenueTrackingAndAnalysisBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxRiskManagementCapability": [
            "http://data.europa.eu/dr8/egovera/FullTaxableBaseDiscoveryBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-DiligenceManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TributaryJusticeManagementCapability": [
            "http://data.europa.eu/dr8/egovera/TributaryJusticeCaseManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPublicAdministrationsBusinessService",
            "http://data.europa.eu/dr8/egovera/DisputeManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/NationalTaxSystemGovernanceCapability": [
            "http://data.europa.eu/dr8/egovera/InterestsAndPenaltiesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxpayersAndStakeholdersRelationshipManagementCapability": [
            "http://data.europa.eu/dr8/egovera/WorkforceAllocationBusinessService"
        ]
    }

    private abbRelations = {
        "http://data.europa.eu/dr8/egovera/TaxCalendarManagementServiceApplicationService": [
            "http://data.europa.eu/dr8/egovera/TaxCalendarBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TransactionInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/AdvanceTaxRulingBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxStatementsBusinessObject": [
            "http://data.europa.eu/dr8/egovera/AdvanceTaxRulingBusinessService",
            "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxReturnsControlBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/EnvironmentalTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxReturnsControlBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxPaymentsBusinessObject": [
            "http://data.europa.eu/dr8/egovera/EnvironmentalTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/CarbonNon-carbonEmissionsBusinessObject": [
            "http://data.europa.eu/dr8/egovera/EnvironmentalTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/BasicTaxpayerInformationBusinessObject":[
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPrivateCompaniesBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/EconomicActivitiesCatalogueDataObject": [
            "http://data.europa.eu/dr8/egovera/EconomicActivityCodesRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/Macro-economicFrameworkBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/NationalSchemaOnCompanyClassificationRulesRequirement": [
            "http://data.europa.eu/dr8/egovera/Cross-borderEUClaimsManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/PropertyManagementAuthorityBusinessActor": [
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/HeritagesAndRentingsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/WorkforceAllocationBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxPayerBehaviorHistoryInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/AgreementsOnDigitalSingleGatewayContract": [
            "http://data.europa.eu/dr8/egovera/MyTaxesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxAnalyticsServiceApplicationService": [
            "http://data.europa.eu/dr8/egovera/Anti-fraudManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/NationalSchemaOnPropertysTaxRequirement": [
            "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxesDueOnLoansAndMortgagesBusinessObject": [
            "http://data.europa.eu/dr8/egovera/LoansAndMortgagesRegistryManagmenetBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/LegislationOnTheDeductibleTaxEsOnLoansAndMortgagesRequirement": [
            "http://data.europa.eu/dr8/egovera/LoansAndMortgagesRegistryManagmenetBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsRegistryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/CatalogueueOfAssetsThatCanBeConfiscatedDataObject": [
            "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsRegistryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/ExportsInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/ThirdCountriesClaimsRecoveryBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/IntangibleAssetsInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/PartrimonyAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/IntangibleAssetsRegistryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TangibleAssetsInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/PartrimonyAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForMobileAssetsBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForPropertiesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxesDueOnTangibleAssetsBusinessObject": [
            "http://data.europa.eu/dr8/egovera/PartrimonyAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForMobileAssetsBusinessService",
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForPropertiesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/DisputeInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/DisputeRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/DisputeManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/InternalAffairsBusinessActor": [
            "http://data.europa.eu/dr8/egovera/InternalAuditingBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/AuditInformationBusinessObject": [
            "http://data.europa.eu/dr8/egovera/InternalAuditingBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/VATReturnsBusinessObject": [
            "http://data.europa.eu/dr8/egovera/ValueAddedTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/VATBusinessObject": [
            "http://data.europa.eu/dr8/egovera/ValueAddedTaxCalculationAndPaymentBusinessService",
            "http://data.europa.eu/dr8/egovera/InterestsAndPenaltiesBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/FullBaseDiscoveryApplicationService": [
            "http://data.europa.eu/dr8/egovera/FullTaxableBaseDiscoveryBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TributaryJusticeCourtBusinessActor": [
            "http://data.europa.eu/dr8/egovera/TributaryJusticeCaseManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/NationalSchemaOnTributaryCourtCasesRequirement": [
            "http://data.europa.eu/dr8/egovera/TributaryJusticeCaseManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/FiscalStudiesBusinessObject": [
            "http://data.europa.eu/dr8/egovera/RevenueTrackingAndAnalysisBusinessService",
            "http://data.europa.eu/dr8/egovera/Macro-economicFrameworkBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxBaseAmountsRegistryDataObject": [
            "http://data.europa.eu/dr8/egovera/TaxProfessionalsAndAgentsRegistryManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxAuditPoliciesBusinessObject": [
            "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-DiligenceManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-TaxReturnsControlBusinessService",
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/NationalSchemaOnMobileAssetsRequirement": [
            "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForMobileAssetsBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/FinancialServiceProviderBusinessActor": [
            "http://data.europa.eu/dr8/egovera/FinancialFlowsManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/PublicAdministrationBusinessActor": [
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPublicAdministrationsBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/RegisteredExciseTaxPayerBusinessActor": [
            "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/DeclarationOfExciseBusinessObject": [
            "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxpayerBehaviorHistoryMetadataDataObject": [
            "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/PublicTaxMetadataDataObject": [
            "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService",
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxCodingSystemManagementApplicationService": [
            "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/TaxAdministrationBusinessActor": [
            "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/BankingDataBusinessObject": [
            "http://data.europa.eu/dr8/egovera/BankinngAccountsMonitoringBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/FiscalDataSetsCatalogueDataObject": [
            "http://data.europa.eu/dr8/egovera/FiscalProfessionsAndQualificationsRegistryManagementBusinessService"
        ],
        "http://data.europa.eu/dr8/egovera/EuropeanHarmonisedTaxDataPoliciesBusinessObject": [
            "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService"
        ]
    }

    private dpsRelations = {
        "http://data.europa.eu/dr8/egovera/TaxCalendarBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability", 
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxCalendarManagementServiceApplicationService"
            ]
        },
        "http://data.europa.eu/dr8/egovera/AdvanceTaxRulingBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability", 
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TransactionInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxStatementsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/EnvironmentalTaxCalculationAndPaymentBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/RevenueFeeCollectionForRegularAndSpecialCasesCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxPaymentsBusinessObject",
                "http://data.europa.eu/dr8/egovera/CarbonNon-carbonEmissionsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPrivateCompaniesBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability", 
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/BasicTaxpayerInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/EconomicActivityCodesRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/EconomicEventsMonitoringCapability", 
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/EconomicActivitiesCatalogueDataObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/Cross-borderEUClaimsManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/InternationalTaxManagementCapability", 
                "http://data.europa.eu/dr8/egovera/InternationalTaxInformationCollectionCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/NationalSchemaOnCompanyClassificationRulesRequirement"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxHistoryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability", 
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability", 
                "http://data.europa.eu/dr8/egovera/InternationalTaxInformationCollectionCapability", 
                "http://data.europa.eu/dr8/egovera/TaxHistoricalSeriesAnalysisAndTaxCasesManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/PropertyManagementAuthorityBusinessActor",
                "http://data.europa.eu/dr8/egovera/TaxPayerBehaviorHistoryInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/MyTaxesBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability", 
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability", 
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/AgreementsOnDigitalSingleGatewayContract"
            ]
        },
        "http://data.europa.eu/dr8/egovera/Anti-fraudManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/EconomicEventsMonitoringCapability", 
                "http://data.europa.eu/dr8/egovera/InternalInspectionAndAuditingCapability", 
                "http://data.europa.eu/dr8/egovera/InspectionAndAuditingCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAnalyticsServiceApplicationService"
            ]
        },
        "http://data.europa.eu/dr8/egovera/PropertyTaxCalculationAndPaymentBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability", 
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/NationalSchemaOnPropertysTaxRequirement",
                "http://data.europa.eu/dr8/egovera/PropertyManagementAuthorityBusinessActor",
                "http://data.europa.eu/dr8/egovera/TaxPaymentsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/LoansAndMortgagesRegistryManagmenetBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxesDueOnLoansAndMortgagesBusinessObject",
                "http://data.europa.eu/dr8/egovera/LegislationOnTheDeductibleTaxEsOnLoansAndMortgagesRequirement"
            ]
        },
        "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/ConfiscatedAssetsInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/CatalogueueOfAssetsThatCanBeConfiscatedDataObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/ThirdCountriesClaimsRecoveryBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/InternationalTaxManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/ExportsInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/PartrimonyAnalysisBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxStudiesAndResearchCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/IntangibleAssetsInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TangibleAssetsInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxesDueOnTangibleAssetsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/DisputeRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/DisputeInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/InternalAuditingBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/InternalInspectionAndAuditingCapability",
                "http://data.europa.eu/dr8/egovera/InspectionAndAuditingCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/InternalAffairsBusinessActor",
                "http://data.europa.eu/dr8/egovera/AuditInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/ValueAddedTaxCalculationAndPaymentBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/VATReturnsBusinessObject",
                "http://data.europa.eu/dr8/egovera/VATBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/IntangibleAssetsRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/IntangibleAssetsInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/FullTaxableBaseDiscoveryBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxRiskManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/FullBaseDiscoveryApplicationService"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TributaryJusticeCaseManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TributaryJusticeManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TributaryJusticeCourtBusinessActor",
                "http://data.europa.eu/dr8/egovera/NationalSchemaOnTributaryCourtCasesRequirement"
            ]
        },
        "http://data.europa.eu/dr8/egovera/RevenueTrackingAndAnalysisBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/RevenueFeeCollectionForRegularAndSpecialCasesCapability",
                "http://data.europa.eu/dr8/egovera/TaxStudiesAndResearchCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/FiscalStudiesBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxProfessionalsAndAgentsRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxBaseAmountsRegistryDataObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxPre-AuditAndDue-DiligenceManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability",
                "http://data.europa.eu/dr8/egovera/TaxRiskManagementCapability",
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAuditPoliciesBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/IncomeTaxCalculationAndPaymentBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability",
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxPaymentsBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxStatementsBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForMobileAssetsBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/NationalSchemaOnMobileAssetsRequirement",
                "http://data.europa.eu/dr8/egovera/TaxesDueOnTangibleAssetsBusinessObject",
                "http://data.europa.eu/dr8/egovera/TangibleAssetsInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/Macro-economicFrameworkBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/EconomicEventsMonitoringCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/EconomicActivitiesCatalogueDataObject",
                "http://data.europa.eu/dr8/egovera/FiscalStudiesBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/FinancialFlowsManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/FinancialServiceProviderBusinessActor"
            ]
        },
        "http://data.europa.eu/dr8/egovera/HeritagesAndRentingsManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/RevenueFeeCollectionForRegularAndSpecialCasesCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/PropertyManagementAuthorityBusinessActor"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForPublicAdministrationsBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TributaryJusticeManagementCapability",
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability",
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/PublicAdministrationBusinessActor"
            ]
        },
        "http://data.europa.eu/dr8/egovera/DisputeManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TributaryJusticeManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/DisputeInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/ExciseTaxCalculationAndPaymentBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability",
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/RegisteredExciseTaxPayerBusinessActor",
                "http://data.europa.eu/dr8/egovera/DeclarationOfExciseBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxpayerRegistryManagementForIndividualsBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability",
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability",
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxpayerBehaviorHistoryMetadataDataObject",
                "http://data.europa.eu/dr8/egovera/BasicTaxpayerInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxPayerBehaviorHistoryInformationBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/StateTaxCatalogManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability",
                "http://data.europa.eu/dr8/egovera/InternationalTaxInformationCollectionCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/PublicTaxMetadataDataObject",
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxCodingSystemManagementApplicationService"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxClaimsManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxRiskManagementCapability",
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability",
                "http://data.europa.eu/dr8/egovera/InternationalTaxManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/PublicTaxMetadataDataObject",
                "http://data.europa.eu/dr8/egovera/TaxBaseAmountsRegistryDataObject",
                "http://data.europa.eu/dr8/egovera/TaxAdministrationBusinessActor"
            ]
        },
        "http://data.europa.eu/dr8/egovera/BankinngAccountsMonitoringBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/RevenueFeeCollectionForRegularAndSpecialCasesCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/BankingDataBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/FiscalProfessionsAndQualificationsRegistryManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxProfessionalsRegistryManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/FiscalDataSetsCatalogueDataObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TaxReturnsControlBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayerTaxReturnsAndTransactionInformationCollectionCapability",
                "http://data.europa.eu/dr8/egovera/TaxRulesManagementForProcessingTaxReturnsCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TaxAndExciseInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxAuditPoliciesBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxStatementsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/InterestsAndPenaltiesBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/NationalTaxSystemGovernanceCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/VATBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/TangibleAssetsRegistryManagementForPropertiesBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxPlanningCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/TangibleAssetsInformationBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxesDueOnTangibleAssetsBusinessObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/EuropeanTaxCatalogManagementBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/InternationalTaxInformationCollectionCapability",
                "http://data.europa.eu/dr8/egovera/TaxAuthoritiesRegistriesCataloguesManagementCapability",
                "http://data.europa.eu/dr8/egovera/InternationalTaxManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/EuropeanHarmonisedTaxDataPoliciesBusinessObject",
                "http://data.europa.eu/dr8/egovera/TaxAuditPoliciesBusinessObject",
                "http://data.europa.eu/dr8/egovera/PublicTaxMetadataDataObject"
            ]
        },
        "http://data.europa.eu/dr8/egovera/WorkforceAllocationBusinessService": {
            "dbc": [
                "http://data.europa.eu/dr8/egovera/TaxpayersAndStakeholdersRelationshipManagementCapability"
            ],
            "abb": [
                "http://data.europa.eu/dr8/egovera/PropertyManagementAuthorityBusinessActor"
            ]
        }
    }

    public getABBRelations(pABBPURI: string) {
        return this.abbRelations[pABBPURI];
    }

    public getDBCRelations(pDBCPURI: string) {
        return this.dbcRelations[pDBCPURI];
    }

    public getDPSRelations(pDPSPURI: string) {
        return this.dpsRelations[pDPSPURI];
    }
}