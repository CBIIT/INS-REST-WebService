/**
 * Fixtures for the dataset.service.test.js file
 */

export const inclusiveSearchText = ''; // Search text that matches all datasets
export const normalSearchText = 'multiple myeloma';
export const inclusiveFilters = {}; // Filters that match all datasets
export const normalFilters = {
  primary_disease: [
    "Melanoma",
    "Multiple Cancer Types",
  ],
  dataset_source_repo: [
    "CEDCD",
    "dbGaP",
  ],
};
export const inclusiveOptions = {}; // Options that match all datasets
export const normalOptions = {
  pageInfo: {
    page: 1,
    pageSize: 10,
  },
  sort: {
    name: "Dataset",
    k: "dataset_title_sort",
    v: "asc",
  },
};

// Copied from the actual Opensearch response received inside the search() function
// Truncated to only 3 results
export const normalOpensearchResults = {
  hits: {
    total: {
      value: 105,
      relation: "eq",
    },
    max_score: null,
    hits: [
      {
        _index: "datasets",
        _id: "wgKss5sBxNS2-GapIa8v",
        _score: null,
        _source: {
          dataset_maximum_age_at_baseline: null,
          related_terms: "Breast Carcinoma In Situ;Carcinoma, Ductal, Breast;Multifactorial Inheritance;LCIS - lobular carcinoma in situ;LCIS, Lobular Carcinoma In Situ;Lobular Carcinoma In Situ",
          description: "<p>We evaluate the validity of repurposing archival tissue specimens for germline genetic studies. We performed lc-WGS and imputed genotypes on 10 pairs of matching blood and tumor tissue and benchmarked the accuracy of genome-wide genotypes, HLA haplotypes, and several polygenic risk scores (PRSs). The reported results indicate the high accuracy of germline genotypes and haplotypes obtained from archival tissue DNA. Using this methodology, we estimate breast cancer PRS in 36 Ductal carcinoma in situ (DCIS) patients and demonstrate its association with breast cancer subsequent event (BCSE).  </p><p>A description of this work is available in medRxiv: <a href='https://www.medrxiv.org/content/10.1101/2022.03.31.22273116v1' target='_blank'>https://www.medrxiv.org/content/10.1101/2022.03.31.22273116v1</a><br></p>",
          dataset_year_enrollment_ended: null,
          study_links: "",
          dataset_source_id: "phs002865",
          limitations_for_reuse: "GRU",
          funding_source: "",
          related_genes: "",
          experimental_approaches: null,
          dataset_title: "Accurate Genome-Wide Germline DNA Profiling from Decade-Old Archival Tissue Specimens",
          dataset_pmid: "",
          dataset_doc: "Office of Data Sharing (ODS)",
          related_diseases: "Multifactorial Inheritance;Carcinoma, Ductal, Breast;Breast Neoplasms;Breast Carcinoma In Situ;Sequence Analysis;High-Throughput Nucleotide Sequencing;Genotyping Techniques;Prognosis",
          PI_name: "Olivier Harismendy",
          dataset_source_repo: "dbGaP",
          participant_count: 50,
          study_type: "Sequencing",
          release_date: "2022-08-25",
          dataset_minimum_age_at_baseline: null,
          primary_disease: "Multiple Cancer Types",
          sample_count: 50,
          dataset_source_url: "https://www.ncbi.nlm.nih.gov/projects/gap/cgi-bin/study.cgi?study_id=phs002865",
          dataset_year_enrollment_started: null,
          institute: null,
          assay_method: "WGS",
        },
        highlight: {
          "description.search": [
            "<p>We evaluate the validity of repurposing archival tissue specimens for germline genetic studies. We performed lc-WGS and imputed genotypes on 10 pairs of matching blood and tumor tissue and benchmarked the accuracy of genome-wide genotypes, HLA haplotypes, and several polygenic risk scores (PRSs). The reported res<b>ult</b>s indicate the high accuracy of germline genotypes and haplotypes obtained from archival tissue DNA. Using this methodology, we estimate breast cancer PRS in 36 Ductal carcin<b>oma</b> in situ (DCIS) patients and demonstrate its association with breast cancer subsequent event (BCSE).  </p><p>A description of this work is available in medRxiv: <a href='https://www.medrxiv.org/content/10.1101/2022.03.31.22273116v1' target='_blank'>https://www.medrxiv.org/content/10.1101/2022.03.31.22273116v1</a><br></p>",
          ],
          "primary_disease.search": [
            "<b>Multiple</b> Cancer Types",
          ],
        },
        sort: [
          "accurategenomewidegermlinednaprofilingfromdecadeoldarchivaltissuespecimens",
        ],
      },
      {
        _index: "datasets",
        _id: "-AKss5sBxNS2-GapMLLe",
        _score: null,
        _source: {
          dataset_maximum_age_at_baseline: 69,
          related_terms: "Buffy Coat and/or Lymphocytes, Feces, Saliva and/or Buccal, Serum and/or Plasma, Tumor Tissue FFPE, Tumor Tissue Fresh/Frozen, Urine",
          description: "The Black Women's Health Study (BWHS) is an ongoing follow-up study for cancer and other serious illnesses in U.S. Black women. The study began in 1995 when 59,000 women (median age, 38) from across the U.S. enrolled by completing health questionnaires. The BWHS has successfully followed participants with biennial questionnaires for data on incident disease and medical, reproductive, behavioral, psychosocial, and socioeconomic factors. Follow-up is also conducted through 24 cancer registries and the National Death Index. Participants' addresses have been linked to U.S. census data and to air pollution data. Cancer diagnoses are validated by pathology data from hospitals and cancer registries. A DNA biorepository was established through collection of cheek cell samples from 26,800 participants. Additionally, approximately 13,000 participants have provided blood samples and 900 have provided tumor tissue.  The top priority of the BWHS is to conduct research on diseases that disproportionately affect Black Americans, including cancers, stroke, heart disease, type 2 diabetes, chronic kidney disease, lupus, sarcoidosis, and others.",
          dataset_year_enrollment_ended: "1995",
          study_links: "http://www.bu.edu/bwhs/",
          dataset_source_id: "82",
          limitations_for_reuse: "",
          funding_source: "",
          related_genes: "",
          experimental_approaches: null,
          dataset_title: "A Follow-up Study for Causes of Cancer in Black Women:  Black Women's Health Study",
          dataset_pmid: "",
          dataset_doc: "Division of Cancer Control and Population Sciences (DCCPS)",
          related_diseases: "All Other Cancers, Bladder, Bone, Brain, Cervical carcinoma in situ (CIN II/III, CIS, AIS), Cervix (Squamous cell carcinoma, Adenocarcinoma), Colon, Corpus, body of uterus, Ductal carcinoma in situ of breast, Esophagus, Gall bladder and extrahepatic bile ducts, Hodgkin Lymphoma, Invasive Breast Cancer, Kidney and other unspecified urinary organs, Leukemia, Liver and intrahepatic bile ducts, Lung and bronchus, Melanoma (excluding mucosal sites), Myeloma, No Cancer, Non-Hodgkin Lymphoma, Oropharyngeal, Ovary, fallopian tube, broad ligament, Pancreas, Prostate, Rectum and anus, Small intestine, Stomach, Thyroid",
          PI_name: "Julie Palmer, ScD, Lynn Rosenberg, ScD",
          dataset_source_repo: "CEDCD",
          participant_count: 59000,
          study_type: "Etiology",
          release_date: null,
          dataset_minimum_age_at_baseline: 21,
          primary_disease: "Multiple Cancer Types",
          sample_count: null,
          dataset_source_url: "https://cedcd.nci.nih.gov/cohort?id=82",
          dataset_year_enrollment_started: "1995",
          institute: null,
          assay_method: "",
        },
        highlight: {
          "description.search": [
            "The Black Women's Health Study (BWHS) is an ongoing follow-up study for cancer and other serious illnesses in U.S. Black women. The study began in 1995 when 59,000 women (median age, 38) from across the U.S. enrolled by com<b>ple</b>ting health questionnaires. The BWHS has successfully followed participants with biennial questionnaires for data on incident disease and medical, reproductive, behavioral, psychosocial, and socioeconomic factors. Follow-up is also conducted through 24 cancer registries and the National Death Index. Participants' addresses have been linked to U.S. census data and to air pollution data. Cancer diagnoses are validated by pathology data from hospitals and cancer registries. A DNA biorepository was established through collection of cheek cell sam<b>ple</b>s from 26,800 participants. Additionally, approximately 13,000 participants have provided blood sam<b>ple</b>s and 900 have provided tumor tissue.  The top priority of the BWHS is to conduct research on diseases that disproportionately affect Black Americans, including cancers, stroke, heart disease, type 2 diabetes, chronic kidney disease, lupus, sarcoidosis, and others.",
          ],
          "primary_disease.search": [
            "<b>Multiple</b> Cancer Types",
          ],
          "related_diseases.search": [
            "All Other Cancers, Bladder, Bone, Brain, Cervical carcinoma in situ (CIN II/III, CIS, AIS), Cervix (Squamous cell carcinoma, Adenocarcinoma), Colon, Corpus, body of uterus, Ductal carcinoma in situ of breast, Esophagus, Gall bladder and extrahepatic bile ducts, Hodgkin Lymphoma, Invasive Breast Cancer, Kidney and other unspecified urinary organs, Leukemia, Liver and intrahepatic bile ducts, Lung and bronchus, Melanoma (excluding mucosal sites), <b>Myeloma,</b> No Cancer, Non-Hodgkin Lymphoma, Oropharyngeal, Ovary, fallopian tube, broad ligament, Pancreas, Prostate, Rectum and anus, Small intestine, Stomach, Thyroid",
          ],
        },
        sort: [
          "afollowupstudyforcausesofcancerinblackwomenblackwomenshealthstudy",
        ],
      },
      {
        _index: "datasets",
        _id: "7QKss5sBxNS2-GapMLLe",
        _score: null,
        _source: {
          dataset_maximum_age_at_baseline: 64,
          related_terms: "Buffy Coat and/or Lymphocytes, Feces, Saliva and/or Buccal, Serum and/or Plasma, Tumor Tissue FFPE, Tumor Tissue Fresh/Frozen, Urine",
          description: "This study explores potential causes of cancer and other diseases among farmers and their families and among commercial pesticide applicators. Current medical research suggests that while agricultural workers are generally healthier than the general U.S. population, they may have higher rates of some cancers, including leukemia, myeloma, non-Hodgkin's lymphoma, and cancers of the lip, stomach, skin, brain, and prostate. Other conditions, like asthma, neurologic disease, and adverse reproductive outcomes may also be related to agricultural exposures. The Agricultural Health Study is designed to identify occupational, lifestyle, and genetic factors that may affect the rate of diseases in farming populations.  The Agricultural Health Study began in 1994, and will continue to gather information for a number of years about the health of pesticide applicators and their families, details on occupational practices, and information on lifestyle and diet on a periodic basis. The complete set of questionnaires External Web Site Policy may be viewed. Personal identifying information on participants is kept confidential and used only by research staff. Names are not included in any reports. The study results are reported as statistical summaries only.  North Carolina and Iowa were selected for this important study based on a nationwide competition. Both states have strong agricultural sectors with diverse production methods, commodities, and products. Information we learn from these two states will be helpful to farmers throughout the United States and other countries using modern agricultural technologies.",
          dataset_year_enrollment_ended: "1997",
          study_links: "http://aghealth.nih.gov/",
          dataset_source_id: "109",
          limitations_for_reuse: "",
          funding_source: "",
          related_genes: "",
          experimental_approaches: null,
          dataset_title: "Agricultural Health Study",
          dataset_pmid: "",
          dataset_doc: "Division of Cancer Control and Population Sciences (DCCPS)",
          related_diseases: "All Other Cancers, Bladder, Bone, Brain, Cervix (Squamous cell carcinoma, Adenocarcinoma), Colon, Corpus, body of uterus, Esophagus, Gall bladder and extrahepatic bile ducts, Hodgkin Lymphoma, Invasive Breast Cancer, Kidney and other unspecified urinary organs, Leukemia, Liver and intrahepatic bile ducts, Lung and bronchus, Melanoma (excluding mucosal sites), Myeloma, Non-Hodgkin Lymphoma, Oropharyngeal, Ovary, fallopian tube, broad ligament, Pancreas, Prostate, Rectum and anus, Small intestine, Stomach, Thyroid",
          PI_name: "Jonathan Hofmann",
          dataset_source_repo: "CEDCD",
          participant_count: 89656,
          study_type: "Etiology",
          release_date: null,
          dataset_minimum_age_at_baseline: 30,
          primary_disease: "Multiple Cancer Types",
          sample_count: null,
          dataset_source_url: "https://cedcd.nci.nih.gov/cohort?id=109",
          dataset_year_enrollment_started: "1993",
          institute: null,
          assay_method: "",
        },
        highlight: {
          "description.search": [
            "This study explores potential causes of cancer and other diseases among farmers and their families and among commercial pesticide applicators. Current medical research suggests that while agric<b>ult</b>ural workers are generally healthier than the general U.S. population, they may have higher rates of some cancers, including leukemia, <b>myeloma</b>, non-Hodgkin's lymph<b>oma</b>, and cancers of the lip, st<b>oma</b>ch, skin, brain, and prostate. Other conditions, like asthma, neurologic disease, and adverse reproductive outcomes may also be related to agric<b>ult</b>ural exposures. The Agric<b>ult</b>ural Health Study is designed to identify occupational, lifestyle, and genetic factors that may affect the rate of diseases in farming populations.  The Agric<b>ult</b>ural Health Study began in 1994, and will continue to gather information for a number of years about the health of pesticide applicators and their families, details on occupational practices, and information on lifestyle and diet on a periodic basis. The com<b>ple</b>te set of questionnaires External Web Site Policy may be viewed. Personal identifying information on participants is kept confidential and used only by research staff. Names are not included in any reports. The study res<b>ult</b>s are reported as statistical summaries only.  North Carolina and Iowa were selected for this important study based on a nationwide competition. Both states have strong agric<b>ult</b>ural sectors with diverse production methods, commodities, and products. Information we learn from these two states will be helpful to farmers throughout the United States and other countries using modern agric<b>ult</b>ural technologies.",
          ],
          "primary_disease.search": [
            "<b>Multiple</b> Cancer Types",
          ],
          "related_diseases.search": [
            "All Other Cancers, Bladder, Bone, Brain, Cervix (Squamous cell carcinoma, Adenocarcinoma), Colon, Corpus, body of uterus, Esophagus, Gall bladder and extrahepatic bile ducts, Hodgkin Lymphoma, Invasive Breast Cancer, Kidney and other unspecified urinary organs, Leukemia, Liver and intrahepatic bile ducts, Lung and bronchus, Melanoma (excluding mucosal sites), <b>Myeloma,</b> Non-Hodgkin Lymphoma, Oropharyngeal, Ovary, fallopian tube, broad ligament, Pancreas, Prostate, Rectum and anus, Small intestine, Stomach, Thyroid",
          ],
        },
        sort: [
          "agriculturalhealthstudy",
        ],
      },
    ],
  },
  aggs: undefined,
};
