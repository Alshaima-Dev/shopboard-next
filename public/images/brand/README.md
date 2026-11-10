# YANINDA campaign image

## Provenance and use

`yaninda-campaign.jpg` is AI-assisted artwork based on a user-supplied fashion composition featuring a burgundy blazer, cream shirt, handbag, knitwear, sneakers, watch, and sunglasses. The original fashion reference file is not present in this directory. The built-in OpenAI image editing tool removed partial lettering and a black outer frame while preserving the composition.

The artwork illustrates the boutique identity. It is not a verified photograph of real inventory or a claim that every pictured item is a catalog listing. The web image is 1200 x 1200, JPEG quality 88, about 166 KiB. It uses contain sizing to keep the full composition visible.

## Brand source artwork

The original React project's `yaninda-selected-original.png` remains the read-only identity source master; it is not loaded or duplicated here. This migration copies the campaign JPEG unchanged. The website renders its ribbon through `src/components/layout/brand-mark.tsx` and uses editable YANINDA text.

## Replacing the campaign

Replace `yaninda-campaign.jpg` here, or update its image path in `src/features/storefront/campaign-image.tsx`. Keep the component's image dimensions accurate. Update `heroAlt` in all three language dictionaries in `src/features/i18n/i18n.ts` when the subject changes. CampaignImage handles image failures using the shared fallback asset and translated unavailable message.

Use only original artwork or images you have permission to use. Record the creator/source, applicable license or permission, and any AI assistance here when replacing an asset. The source artwork remains a separate provenance asset and should not be replaced or removed as part of a campaign update.
