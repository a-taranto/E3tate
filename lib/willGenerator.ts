import { WillData } from '@/types/will';

/**
 * Generates legal will document text from WillData
 */
export function generateWillDocument(data: WillData): string {
  const sections: string[] = [];

  // Title
  sections.push('LAST WILL AND TESTAMENT');
  sections.push('');
  sections.push('═'.repeat(60));
  sections.push('');

  // Introduction
  sections.push(`I, ${data.personalInfo.fullName}, born on ${formatDate(data.personalInfo.dateOfBirth)}, residing at ${data.personalInfo.streetAddress}, ${data.personalInfo.city}, ${data.personalInfo.state} ${data.personalInfo.zipCode}, ${data.personalInfo.country}, being of sound mind and disposing memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils heretofore made by me.`);
  sections.push('');

  // Article I: Executors
  sections.push('ARTICLE I: APPOINTMENT OF EXECUTOR');
  sections.push('');

  const primaryExecutor = data.executors.find(e => e.isPrimary);
  if (primaryExecutor) {
    sections.push(`I hereby nominate and appoint ${primaryExecutor.name}, my ${primaryExecutor.relationship}, residing at ${primaryExecutor.email}, as the Executor of this my Last Will and Testament.`);
    sections.push('');
  }

  const alternateExecutors = data.executors.filter(e => !e.isPrimary);
  if (alternateExecutors.length > 0) {
    sections.push('If the named Executor is unable or unwilling to serve, I nominate the following as alternate Executors in the order listed:');
    alternateExecutors.forEach((executor, index) => {
      sections.push(`${index + 1}. ${executor.name}, my ${executor.relationship}`);
    });
    sections.push('');
  }

  sections.push('I grant my Executor full power and authority to sell, convey, lease, mortgage, or otherwise dispose of any and all property, real or personal, which I may own at my death, and to execute all deeds, contracts, and other instruments necessary to carry out the provisions of this Will.');
  sections.push('');

  // Article II: Beneficiaries and Distribution
  sections.push('ARTICLE II: DISTRIBUTION OF ESTATE');
  sections.push('');
  sections.push('I give, devise, and bequeath all of my property, both real and personal, of whatsoever kind and wheresoever situated, which I may own or have the right to dispose of at the time of my death, as follows:');
  sections.push('');

  if (data.beneficiaries.length > 0) {
    data.beneficiaries.forEach((beneficiary) => {
      sections.push(`${beneficiary.percentage}% of my estate to ${beneficiary.name}, my ${beneficiary.relationship}${beneficiary.email ? ` (${beneficiary.email})` : ''}.`);
    });
    sections.push('');
  }

  sections.push('If any beneficiary named herein shall predecease me, then the share of such beneficiary shall be distributed equally among the surviving beneficiaries.');
  sections.push('');

  // Article III: Digital Assets
  if (data.digitalAssets.length > 0) {
    sections.push('ARTICLE III: DIGITAL ASSETS');
    sections.push('');
    sections.push('I direct my Executor to distribute my digital assets as follows:');
    sections.push('');

    data.digitalAssets.forEach((asset, index) => {
      sections.push(`${index + 1}. ${asset.name} (${asset.type})`);
      sections.push(`   Assignee: ${asset.assignee}`);
      if (asset.instructions) {
        sections.push(`   Instructions: ${asset.instructions}`);
      }
      sections.push('');
    });
  }

  // Article IV: Physical Assets
  if (data.physicalAssets.length > 0) {
    sections.push('ARTICLE IV: SPECIFIC BEQUESTS');
    sections.push('');
    sections.push('I make the following specific bequests of property:');
    sections.push('');

    data.physicalAssets.forEach((asset, index) => {
      sections.push(`${index + 1}. ${asset.name} (${asset.type})`);
      sections.push(`   To: ${asset.assignee}`);
      if (asset.value) {
        sections.push(`   Estimated Value: $${asset.value.toLocaleString()}`);
      }
      if (asset.notes) {
        sections.push(`   Notes: ${asset.notes}`);
      }
      sections.push('');
    });
  }

  // Article V: Final Wishes
  sections.push('ARTICLE V: BURIAL AND FINAL WISHES');
  sections.push('');

  const burialMap = {
    burial: 'traditional burial',
    cremation: 'cremation',
    donation: 'donation of my body to medical science',
    other: 'disposition as specified below',
  };

  sections.push(`It is my wish that upon my death, my remains be disposed of by ${burialMap[data.finalWishes.burialPreference]}.`);
  sections.push('');

  if (data.finalWishes.burialDetails) {
    sections.push(`Specific arrangements: ${data.finalWishes.burialDetails}`);
    sections.push('');
  }

  if (data.finalWishes.memorialInstructions) {
    sections.push('Memorial Service Instructions:');
    sections.push(data.finalWishes.memorialInstructions);
    sections.push('');
  }

  if (data.finalWishes.executorInstructions) {
    sections.push('Additional Instructions to Executor:');
    sections.push(data.finalWishes.executorInstructions);
    sections.push('');
  }

  // Closing
  sections.push('');
  sections.push('IN WITNESS WHEREOF, I have hereunto set my hand this _____ day of _____________, 20___.');
  sections.push('');
  sections.push('');
  sections.push('_'.repeat(50));
  sections.push(`${data.personalInfo.fullName}, Testator`);
  sections.push('');
  sections.push('');

  // Witness Section
  sections.push('ATTESTATION CLAUSE');
  sections.push('');
  sections.push('The foregoing instrument was signed, published, and declared by the above-named Testator as and for their Last Will and Testament, in our presence, and we, at their request and in their presence, and in the presence of each other, have subscribed our names as witnesses thereto, this _____ day of _____________, 20___.');
  sections.push('');
  sections.push('');
  sections.push('Witness #1:');
  sections.push('');
  sections.push('_'.repeat(50));
  sections.push('Signature');
  sections.push('');
  sections.push('Name (printed): _____________________________');
  sections.push('');
  sections.push('Address: _____________________________');
  sections.push('');
  sections.push('');
  sections.push('Witness #2:');
  sections.push('');
  sections.push('_'.repeat(50));
  sections.push('Signature');
  sections.push('');
  sections.push('Name (printed): _____________________________');
  sections.push('');
  sections.push('Address: _____________________________');
  sections.push('');
  sections.push('');

  // Notary Section
  sections.push('NOTARY ACKNOWLEDGMENT');
  sections.push('');
  sections.push('State of: _____________________________');
  sections.push('');
  sections.push('County of: _____________________________');
  sections.push('');
  sections.push('On this _____ day of _____________, 20___, before me, the undersigned Notary Public, personally appeared the above-named Testator and witnesses, known to me to be the persons whose names are subscribed to the foregoing instrument, and acknowledged that they executed the same as their free act and deed.');
  sections.push('');
  sections.push('');
  sections.push('_'.repeat(50));
  sections.push('Notary Public');
  sections.push('');
  sections.push('My Commission Expires: _____________________________');
  sections.push('');
  sections.push('');

  // Footer
  if (data.reviewingAttorney) {
    sections.push('═'.repeat(60));
    sections.push('');
    sections.push(`Reviewed by: ${data.reviewingAttorney}`);
    sections.push('');
  }

  sections.push('═'.repeat(60));
  sections.push('');
  sections.push(`Document created: ${formatDate(data.createdAt)}`);
  sections.push(`Last updated: ${formatDate(data.updatedAt)}`);
  sections.push('');
  sections.push('Generated by E3tate Will Builder');
  sections.push('This document should be reviewed by a qualified attorney before signing.');

  return sections.join('\n');
}

function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
