export const MOCK_REPORTS = [
  {
    id: 'report-cbc-glucose',
    title: 'Complete Blood Count & Glycemic Panel',
    patient: 'Sample Patient (Demo)',
    date: '12 Nov 2026',
    lab: 'Metropolitan Clinical Diagnostics',
    fileType: 'PDF Document',
    fileName: 'cbc_blood_panel_sample.pdf',
    overallStatus: 'Needs Attention (Mild Variance)',
    summary: 'Most of your blood cell counts are within standard healthy ranges. However, your fasting blood glucose and HbA1c are slightly above standard reference limits, which suggests reviewing your recent dietary carbohydrate patterns with your healthcare provider. Your hemoglobin is also slightly below standard, indicating mild borderline anemia.',
    biomarkers: [
      {
        name: 'Hemoglobin (Hb)',
        category: 'Red Blood Cells',
        value: '11.2',
        unit: 'g/dL',
        referenceRange: '12.0 - 15.5 g/dL',
        status: 'low',
        explanation: 'Hemoglobin is the iron-rich protein in red blood cells that transports oxygen throughout your body. A reading slightly below the standard range may lead to feeling easily fatigued or sluggish and is commonly linked with dietary iron levels.'
      },
      {
        name: 'White Blood Cell Count (WBC)',
        category: 'Immune Defense',
        value: '6,800',
        unit: '/µL',
        referenceRange: '4,500 - 11,000 /µL',
        status: 'normal',
        explanation: 'White blood cells are your body’s infection defense team. Your count is well within the expected window, suggesting no active bacterial infections or acute inflammatory flare-ups.'
      },
      {
        name: 'Platelet Count',
        category: 'Clotting',
        value: '265,000',
        unit: '/µL',
        referenceRange: '150,000 - 450,000 /µL',
        status: 'normal',
        explanation: 'Platelets are tiny cell fragments that help your blood clot to stop cuts or bruises from bleeding excessively. Your count is completely normal.'
      },
      {
        name: 'Fasting Blood Glucose',
        category: 'Metabolic & Sugar',
        value: '118',
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'elevated',
        explanation: 'Measures circulating blood sugar after at least 8 hours without food. A reading of 118 mg/dL is moderately elevated (pre-diabetes range: 100–125 mg/dL) and indicates your body is taking longer to process dietary carbohydrates.'
      },
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        category: 'Metabolic & Sugar',
        value: '6.0',
        unit: '%',
        referenceRange: '< 5.7 %',
        status: 'elevated',
        explanation: 'Reflects your average blood sugar levels over the past 90 days. A value of 6.0% suggests consistent mild blood sugar elevation, which is very responsive to daily walking and nutritional tweaks.'
      },
      {
        name: 'Serum Creatinine',
        category: 'Kidney Function',
        value: '0.85',
        unit: 'mg/dL',
        referenceRange: '0.6 - 1.2 mg/dL',
        status: 'normal',
        explanation: 'A natural byproduct of daily muscle usage filtered out by the kidneys. This normal reading indicates your kidneys are filtering waste efficiently.'
      }
    ],
    doctorQuestions: [
      {
        question: 'Could my mild hemoglobin level be related to dietary iron, or should we check ferritin levels?',
        reason: 'Helps distinguish between temporary dietary shortfall and other causes of low red blood cell counts.'
      },
      {
        question: 'What lifestyle or nutritional adjustments do you suggest for my elevated fasting blood glucose?',
        reason: 'Early lifestyle interventions are highly effective at normalizing pre-diabetic blood sugar readings.'
      },
      {
        question: 'When should I schedule a follow-up test to monitor these values?',
        reason: 'Tracking values over 3 to 6 months provides a clearer trend than a single snapshot in time.'
      }
    ],
    glossary: [
      {
        term: 'Reference Range',
        meaning: 'The expected numerical interval that 95% of healthy individuals fall into for a specific laboratory analyzer.'
      },
      {
        term: 'HbA1c',
        meaning: 'A test measuring the percentage of hemoglobin coated with sugar, giving a 3-month overview of blood sugar stability.'
      },
      {
        term: 'Platelets',
        meaning: 'Specialized blood cells that plug minor injuries and assist in healthy wound closure.'
      }
    ]
  },
  {
    id: 'report-lipid',
    title: 'Cardiovascular Lipid Profile',
    patient: 'Sample Patient (Demo)',
    date: '08 Nov 2026',
    lab: 'Apex Heart & Vascular Diagnostics',
    fileType: 'JPG Image',
    fileName: 'lipid_profile_scan.jpg',
    overallStatus: 'Elevated Lipids (Review Recommended)',
    summary: 'This panel examines lipid (fat) concentrations in your blood. Your Total Cholesterol and LDL ("bad cholesterol") are moderately elevated, while your HDL ("good cholesterol") is slightly low. Working with your doctor on heart-healthy dietary choices and regular aerobic exercise can help rebalance these proportions.',
    biomarkers: [
      {
        name: 'Total Cholesterol',
        category: 'Lipid Profile',
        value: '232',
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'elevated',
        explanation: 'The combined total of cholesterol circulating in your bloodstream. Values above 200 mg/dL warrant an open discussion with your doctor regarding cardiovascular wellness habits.'
      },
      {
        name: 'LDL Cholesterol ("Bad")',
        category: 'Lipid Profile',
        value: '148',
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'elevated',
        explanation: 'Low-density lipoprotein can gradually accumulate on blood vessel walls over many years. Lowering this through diet (more soluble fiber, fewer trans fats) protects arterial health.'
      },
      {
        name: 'HDL Cholesterol ("Good")',
        category: 'Lipid Profile',
        value: '37',
        unit: 'mg/dL',
        referenceRange: '> 40 mg/dL',
        status: 'low',
        explanation: 'High-density lipoprotein acts as a molecular vacuum cleaner, carrying excess cholesterol back to your liver for elimination. Higher levels are protective.'
      },
      {
        name: 'Triglycerides',
        category: 'Lipid Profile',
        value: '190',
        unit: 'mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'elevated',
        explanation: 'The most common form of stored fat in your body, closely linked to excess sugar, refined grains, and caloric intake.'
      }
    ],
    doctorQuestions: [
      {
        question: 'What specific dietary changes would you recommend to raise my HDL and lower my LDL?',
        reason: 'Targeted nutrition like Mediterranean-style eating often improves lipid ratios.'
      },
      {
        question: 'Do I need further cardiovascular risk stratification, or is a lifestyle trial appropriate first?',
        reason: 'Clarifies whether lifestyle interventions over 3-6 months are sufficient.'
      }
    ],
    glossary: [
      {
        term: 'LDL vs HDL',
        meaning: 'LDL deposits cholesterol into tissues; HDL picks up excess cholesterol and transports it to the liver for recycling.'
      },
      {
        term: 'Triglycerides',
        meaning: 'Fats from food that circulate in your bloodstream to provide energy between meals.'
      }
    ]
  },
  {
    id: 'report-thyroid',
    title: 'Thyroid Function & Metabolic Panel',
    patient: 'Sample Patient (Demo)',
    date: '02 Nov 2026',
    lab: 'Endocrine Diagnostics Institute',
    fileType: 'PNG Image',
    fileName: 'thyroid_tsh_scan.png',
    overallStatus: 'All Values Normal',
    summary: 'All examined thyroid hormones are completely within the standard expected reference intervals. This indicates your thyroid gland is actively producing and regulating metabolic hormones effectively.',
    biomarkers: [
      {
        name: 'TSH (Thyroid Stimulating Hormone)',
        category: 'Thyroid Function',
        value: '2.1',
        unit: 'µIU/mL',
        referenceRange: '0.4 - 4.5 µIU/mL',
        status: 'normal',
        explanation: 'TSH is released by your pituitary gland to prompt the thyroid into action. A value of 2.1 µIU/mL represents balanced, steady endocrine signaling.'
      },
      {
        name: 'Free T4 (Thyroxine)',
        category: 'Thyroid Function',
        value: '1.2',
        unit: 'ng/dL',
        referenceRange: '0.8 - 1.8 ng/dL',
        status: 'normal',
        explanation: 'The main circulating hormone produced by the thyroid gland. A normal reading means your energy regulation is biochemically balanced.'
      },
      {
        name: 'Free T3 (Triiodothyronine)',
        category: 'Thyroid Function',
        value: '3.2',
        unit: 'pg/mL',
        referenceRange: '2.3 - 4.2 pg/mL',
        status: 'normal',
        explanation: 'The active form of thyroid hormone that influences cellular metabolism and heart rate. Your reading is ideal.'
      }
    ],
    doctorQuestions: [
      {
        question: 'Since my thyroid panel is normal, are there other wellness tests we should check for my energy levels?',
        reason: 'Helps your physician explore sleep, stress, or vitamin D levels if you are experiencing fatigue.'
      }
    ],
    glossary: [
      {
        term: 'TSH',
        meaning: 'Thyroid Stimulating Hormone: The brain’s chemical signal telling the thyroid gland how much energy hormone to produce.'
      }
    ]
  }
];
