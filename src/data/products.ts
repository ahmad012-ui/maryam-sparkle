import { Product, Category, InstagramPost, FAQItem } from '../types';

export const HERO_IMAGES = {
  arch: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ',
  circle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh4lw7uCIz4OZIIrgH6vaVNAB4EDYwu6RRCMADMuPH0mHTphMSu69p_b34uRjO9mopq6sXry3YCp0T1p2FNXQxKj84ht7Jbdwxt29BAvfoC5dOxJMh_bF7pEllUCaSwNfgkG2jgxnw5xesGwyE1XrRuzYJ3gCFvQMARdqeuDP2hycZ7d7RnH8HNzpU6_AOXA8Zk2qv2TREPVIYfO_khH1F2glzhBTC9WEjwBCnokhSOIXV2pCRjj05',
  ourStory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDATdxnmVBhRzkdyn0SM9HalaS2SMDFahRt9H_DMDzPjtupUlphizDF-rXfCI9axbXnxaxvbOIxFpBrhgi1vpGmqC-Trnv5KbC42A4twTWZSm374pOg1mt9fNmilCrE6rD8msHptO0syC9qI4aNo3cXr7fBIgKDwOyFKAG4iJg7QPH1Ij5RDaOSfy3CWF-XxVz6qQYEkgksskN8Y-ruXWXNqPAacVy5FTzYVlVqy9FwdhuZ88YDtHXb',
  collectionPlaceholder: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAmq3xqk1Anj84uh6dQD3Ewzqn5JIqtgFr6Px3-2j-Jl4MVNG2lp3IXquHWrZqe9QQTiycSKA66l3VgoEPIIeT1gQa91GLq1Ce3JontJQGWMUS96MHJoiogv_g1ev0d11L9Q4tcRVfDlSNjklBmcawsVcZyL1QG1_1U7WJAn0SPsq7I47XagThOQH-BpGYlrG0ztplraGs8bdgHJ4s1eNmLCez_yR7w2B0rsyYjM38I7rJyNPzLPs6'
};

export const CATEGORIES: Category[] = [
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 14,
    tagline: 'Handcrafted beaded bracelets with delicate charms & chains',
    description: 'Stackable, vibrant bracelets crafted with colorful glass and acrylic beads, charm accents, and delicate linked chains.'
  },
  {
    id: 'anklets',
    name: 'Anklets',
    slug: 'anklets',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 8,
    tagline: 'Sun-kissed anklets featuring colorful beads and golden bells',
    description: 'Delicate waterproof anklets strung with radiant beads, beach-inspired accents, and musical chime bells.'
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 12,
    tagline: 'Layered beaded chokers and bohemian pendant necklaces',
    description: 'Romantic statement chokers with faceted glass beads, charm pendants, and gold-tone linked chains.'
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 9,
    tagline: 'Lightweight hand-woven beaded drops and dangle earrings',
    description: 'Feather-light beaded drops woven with colorful glass seed beads and gold-tone ear hooks.'
  },
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 7,
    tagline: 'Elastic micro-beaded rings with vibrant beads & tiny charms',
    description: 'Comfortable stretch micro-bead stacking rings decorated with miniature glass beads and gold-tone accents.'
  },
  {
    id: 'custom',
    name: 'Custom Pieces',
    slug: 'custom-pieces',
    image: HERO_IMAGES.circle,
    itemCount: 6,
    tagline: 'Bespoke bead palettes, custom name initials & personalized stacks',
    description: 'Bespoke pieces handcrafted to your exact wrist dimensions, custom bead color choices, and letter charms.'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'ruby-star-bracelet',
    slug: 'ruby-star-bracelet',
    name: 'Ruby Star Bracelet',
    category: 'Bracelets',
    price: 1850,
    compareAtPrice: 2200,
    originalPrice: 2200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDATdxnmVBhRzkdyn0SM9HalaS2SMDFahRt9H_DMDzPjtupUlphizDF-rXfCI9axbXnxaxvbOIxFpBrhgi1vpGmqC-Trnv5KbC42A4twTWZSm374pOg1mt9fNmilCrE6rD8msHptO0syC9qI4aNo3cXr7fBIgKDwOyFKAG4iJg7QPH1Ij5RDaOSfy3CWF-XxVz6qQYEkgksskN8Y-ruXWXNqPAacVy5FTzYVlVqy9FwdhuZ88YDtHXb',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBh4lw7uCIz4OZIIrgH6vaVNAB4EDYwu6RRCMADMuPH0mHTphMSu69p_b34uRjO9mopq6sXry3YCp0T1p2FNXQxKj84ht7Jbdwxt29BAvfoC5dOxJMh_bF7pEllUCaSwNfgkG2jgxnw5xesGwyE1XrRuzYJ3gCFvQMARdqeuDP2hycZ7d7RnH8HNzpU6_AOXA8Zk2qv2TREPVIYfO_khH1F2glzhBTC9WEjwBCnokhSOIXV2pCRjj05'
    ],
    description: 'An enchanting handcrafted bracelet crafted with vibrant ruby-red faceted glass crystal beads and delicate gold-tone star charms. Radiates warmth, romance, and celestial elegance.',
    shortDescription: 'Faceted ruby-red glass crystal beads with delicate gold-tone star charms.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Charms'],
    dimensions: 'Bead diameter: 6mm. Wrist size: 6.0" - 7.5" adjustable.',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    colors: ['Deep Ruby', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 12,
    sku: 'MS-BR-001',
    rating: 4.9,
    reviewsCount: 48,
    tags: ['Handmade', 'Star Charm', 'Ruby Red', 'Romantic', 'Beaded Bracelet'],
    careInstructions: 'Avoid spraying perfume directly onto the beads or star charms. Wipe with a dry microfiber cloth.',
    inStock: true
  },
  {
    id: 'green-charm-bracelet',
    slug: 'green-charm-bracelet',
    name: 'Green Charm Bracelet',
    category: 'Bracelets',
    price: 1650,
    compareAtPrice: 1950,
    originalPrice: 1950,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBh4lw7uCIz4OZIIrgH6vaVNAB4EDYwu6RRCMADMuPH0mHTphMSu69p_b34uRjO9mopq6sXry3YCp0T1p2FNXQxKj84ht7Jbdwxt29BAvfoC5dOxJMh_bF7pEllUCaSwNfgkG2jgxnw5xesGwyE1XrRuzYJ3gCFvQMARdqeuDP2hycZ7d7RnH8HNzpU6_AOXA8Zk2qv2TREPVIYfO_khH1F2glzhBTC9WEjwBCnokhSOIXV2pCRjj05'
    ],
    description: 'Inspired by morning dew in spring gardens. Handcrafted with sage and emerald pressed glass beads, botanical leaf charms, and an adjustable gold-tone extender chain.',
    shortDescription: 'Sage green pressed glass beads with botanical leaf charms and gold-tone chain.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
    dimensions: 'Bead diameter: 5mm. Length: 6.5 inches with 1-inch extender.',
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    colors: ['Sage Green', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 9,
    sku: 'MS-BR-002',
    rating: 4.8,
    reviewsCount: 36,
    tags: ['Nature Inspired', 'Botanical', 'Charms', 'Green', 'Everyday', 'Beaded Bracelet'],
    careInstructions: 'Keep dry. Store in a soft jewelry pouch to preserve luster.',
    inStock: true
  },
  {
    id: 'lavender-glow-bracelet',
    slug: 'lavender-glow-bracelet',
    name: 'Lavender Glow Bracelet',
    category: 'Bracelets',
    price: 1750,
    compareAtPrice: 2000,
    originalPrice: 2000,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4HBZrWH9Oiimxl9HdlyhZfWaEIOkg-V3SRpKujIvMA6evxBAJaLeEIGcvtFV8kZcRVMf_Oyb8cc6TgVNh36fhpLx2hGVIECT02kX969KmFctARxsN5FDg91sfCB09Zq__drZcXn62_9LF9aAcHexANxzafjycdC75NSjqrn37UkaXavBjYPkIO801vI5UBql3PbG81LG3InHwcHbTeXhGAH_M07tcU-LWuWIDAVOZE3XH3hU4SDJe',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC4HBZrWH9Oiimxl9HdlyhZfWaEIOkg-V3SRpKujIvMA6evxBAJaLeEIGcvtFV8kZcRVMf_Oyb8cc6TgVNh36fhpLx2hGVIECT02kX969KmFctARxsN5FDg91sfCB09Zq__drZcXn62_9LF9aAcHexANxzafjycdC75NSjqrn37UkaXavBjYPkIO801vI5UBql3PbG81LG3InHwcHbTeXhGAH_M07tcU-LWuWIDAVOZE3XH3hU4SDJe',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDATdxnmVBhRzkdyn0SM9HalaS2SMDFahRt9H_DMDzPjtupUlphizDF-rXfCI9axbXnxaxvbOIxFpBrhgi1vpGmqC-Trnv5KbC42A4twTWZSm374pOg1mt9fNmilCrE6rD8msHptO0syC9qI4aNo3cXr7fBIgKDwOyFKAG4iJg7QPH1Ij5RDaOSfy3CWF-XxVz6qQYEkgksskN8Y-ruXWXNqPAacVy5FTzYVlVqy9FwdhuZ88YDtHXb'
    ],
    description: 'Soft lilac glass beads paired with pastel accent beads and a delicate silk thread tassel drop. Provides a serene, calming touch to everyday outfits.',
    shortDescription: 'Pastel lilac glass beads with soft accent beads and silk tassel drop.',
    materials: ['Beads', 'Silver-Tone Hardware'],
    dimensions: '6.5" comfortable stretch fit.',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    colors: ['Lavender', 'Silver'],
    finish: 'Silver-Tone',
    availableFinishes: ['Silver-Tone'],
    stock: 14,
    sku: 'MS-BR-003',
    rating: 5.0,
    reviewsCount: 29,
    tags: ['Pastel', 'Lilac', 'Calm', 'Purple', 'Handmade', 'Silver-Tone', 'Beaded Bracelet'],
    careInstructions: 'Gently wipe the glass beads with a clean cotton cloth.',
    inStock: true
  },
  {
    id: 'crimson-bead-bracelet',
    slug: 'crimson-bead-bracelet',
    name: 'Crimson Bead Bracelet',
    category: 'Bracelets',
    price: 1950,
    compareAtPrice: 2300,
    originalPrice: 2300,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnsG-9lRJOr_UpaYm29t9VFzZpaxJT18BJHhEr9_76iMLiduwcw6FH54bBVKOV-m3jzpwRtbXQBYWUjFoCre8TFDt10QARj13yCQDP3qc2HJv8aYI-gO2rjwH4YiPVvHOMHukBK57wXD0_7b6RvOCFEoMhZT_mfo-iqGCHQmeEPgB_uuE6_Ui4IhFN9VtWRY9vE5z_VGWCQn08HrpABQjmrDAMFLicR4ouSgF-a5n3_yQ8q9kH8qMF',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCnsG-9lRJOr_UpaYm29t9VFzZpaxJT18BJHhEr9_76iMLiduwcw6FH54bBVKOV-m3jzpwRtbXQBYWUjFoCre8TFDt10QARj13yCQDP3qc2HJv8aYI-gO2rjwH4YiPVvHOMHukBK57wXD0_7b6RvOCFEoMhZT_mfo-iqGCHQmeEPgB_uuE6_Ui4IhFN9VtWRY9vE5z_VGWCQn08HrpABQjmrDAMFLicR4ouSgF-a5n3_yQ8q9kH8qMF'
    ],
    description: 'Double-row rich crimson glass beads accented by gold-tone spacer beads and a linked extender chain. A bold statement piece designed to be stacked or worn solo.',
    shortDescription: 'Double-row crimson glass beads with gold-tone accents and linked chain.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Chain'],
    dimensions: '7.0" with 1.5" extender chain.',
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    colors: ['Crimson Red', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 8,
    sku: 'MS-BR-004',
    rating: 4.9,
    reviewsCount: 52,
    tags: ['Statement', 'Double Layer', 'Crimson Red', 'Beaded Bracelet', 'Boho'],
    careInstructions: 'Store flat to keep the strand drape pristine.',
    inStock: true
  },
  {
    id: 'pearl-drop-bracelet',
    slug: 'pearl-drop-bracelet',
    name: 'Pearl Drop Bracelet',
    category: 'Bracelets',
    price: 1650,
    compareAtPrice: 1950,
    originalPrice: 1950,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ'
    ],
    description: 'Lustrous ivory acrylic pearl beads carefully placed along a delicate gold-tone linked chain with an adjustable extender. The epitome of modern grace.',
    shortDescription: 'Lustrous acrylic pearl beads with delicate gold-tone linked chain.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Chain'],
    dimensions: '6.5" to 7.5" adjustable.',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    colors: ['Ivory Pearl', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 16,
    sku: 'MS-BR-005',
    rating: 4.9,
    reviewsCount: 64,
    tags: ['Pearl Beads', 'Classic', 'Bridal', 'White', 'Chain Bracelet'],
    careInstructions: 'Gently wipe beads with a soft cloth after wearing.',
    inStock: true
  },
  {
    id: 'midnight-bead-bracelet',
    slug: 'midnight-bead-bracelet',
    name: 'Midnight Bead Bracelet',
    category: 'Bracelets',
    price: 1550,
    compareAtPrice: 1800,
    originalPrice: 1800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeL5w6Kn_t9TgkM3l6exc_rFM8zYWh3iQg-GspkHNUrv3plhwCY2M23eXHhEnxYkvOnPeIhn8gEXJOsiCf2CtgPHs6PdJMuoVT-PwP4NRYsqrEmgO1l2-fvg5g0tz6WF6PLB1Iv9_0kOtNqfzYMhwIB8TtUcTAF4-ph_HvrjOPRKo1J0ROFFMypxaOOlNaAN1LtWyLUxMQcynYbi81XsIRLTwOTPB562KyUn2nVkUxOeF0HlWe_heP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeL5w6Kn_t9TgkM3l6exc_rFM8zYWh3iQg-GspkHNUrv3plhwCY2M23eXHhEnxYkvOnPeIhn8gEXJOsiCf2CtgPHs6PdJMuoVT-PwP4NRYsqrEmgO1l2-fvg5g0tz6WF6PLB1Iv9_0kOtNqfzYMhwIB8TtUcTAF4-ph_HvrjOPRKo1J0ROFFMypxaOOlNaAN1LtWyLUxMQcynYbi81XsIRLTwOTPB562KyUn2nVkUxOeF0HlWe_heP'
    ],
    description: 'Matte black acrylic beads accented with carved silver-tone spacer beads. Understated, grounded, and universally styled for all aesthetics.',
    shortDescription: 'Matte black beads with metallic silver-tone spacer beads.',
    materials: ['Beads', 'Silver-Tone Hardware'],
    dimensions: '6.5" or 7.2" stretch fit.',
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    colors: ['Matte Black', 'Silver'],
    finish: 'Silver-Tone',
    availableFinishes: ['Silver-Tone'],
    stock: 11,
    sku: 'MS-BR-006',
    rating: 4.7,
    reviewsCount: 41,
    tags: ['Minimalist', 'Black', 'Casual', 'Silver-Tone', 'Beaded Bracelet'],
    careInstructions: 'Clean with lukewarm water and a soft dry cloth.',
    inStock: true
  },
  {
    id: 'sunlit-golden-charm-anklet',
    slug: 'sunlit-golden-charm-anklet',
    name: 'Sunlit Golden Charm Anklet',
    category: 'Anklets',
    price: 1450,
    compareAtPrice: 1700,
    originalPrice: 1700,
    image: HERO_IMAGES.circle,
    images: [
      HERO_IMAGES.circle,
      HERO_IMAGES.arch
    ],
    description: 'Warm amber-toned glass beads intertwined with dainty gold-tone sun charms and tiny bells that softly chime with each gentle step.',
    shortDescription: 'Amber glass beads with gold-tone sun charms, chain extender, and chime bells.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
    dimensions: '9.0" with 2.0" extension chain.',
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    colors: ['Golden Amber', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 10,
    sku: 'MS-AK-001',
    rating: 4.9,
    reviewsCount: 19,
    tags: ['Anklet', 'Summer', 'Sun Charm', 'Amber Hues', 'Bohemian', 'Beaded Anklet'],
    careInstructions: 'Water-safe cord and chain. Rinse with fresh water after seaside walks.',
    inStock: true
  },
  {
    id: 'ocean-wave-anklet',
    slug: 'ocean-wave-beaded-anklet',
    name: 'Ocean Wave Beaded Anklet',
    category: 'Anklets',
    price: 1550,
    compareAtPrice: 1850,
    originalPrice: 1850,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP'
    ],
    description: 'Vibrant teal-colored glass beads combined with acrylic mini shell beads and waterproof cord for sunny beach days and summer escapes.',
    shortDescription: 'Teal-colored glass beads with miniature shell beads on waterproof cord.',
    materials: ['Beads', 'Waterproof Cord'],
    dimensions: '8.5" to 10.5" adjustable sliding knot.',
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    colors: ['Ocean Teal', 'Sand'],
    finish: 'Waterproof Cord',
    availableFinishes: ['Waterproof Cord'],
    stock: 7,
    sku: 'MS-AK-002',
    rating: 4.8,
    reviewsCount: 22,
    tags: ['Beach', 'Teal', 'Bohemian', 'Anklet', 'Beaded Anklet'],
    careInstructions: 'Designed for daily wear and beach trips.',
    inStock: true
  },
  {
    id: 'celestial-rose-choker',
    slug: 'celestial-rose-choker',
    name: 'Celestial Rose Choker',
    category: 'Necklaces',
    price: 2450,
    compareAtPrice: 2800,
    originalPrice: 2800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1Cf_7jKCngt0y5eaF-HMI6jEb-oIpozN3LUQiTO-_vhR_gYJfHn1t8C8nCfy-kYiRKPkVa5797yt-t3ZKrfmSkGyvK5dhoV1eBvzBOERD1_bf0uuYWnAS1TzGSNgLy4_mFCfVfHuiIoYA7pc3xzsTAIKeUfOu5rjPD1oIBsu3Z6z_UGhHF-Vzw3IQ6U3Fo7kGPc7FNkKoTyCtBHYZszvPhtRqRXcSZGapUgWYhwSml00a2p1-_WAZ'
    ],
    description: 'A romantic choker featuring blush pink faceted glass beads, star charms, and a delicate gold-tone linked chain. Perfect for layered styles.',
    shortDescription: 'Blush pink glass beads with star charms and gold-tone linked chain.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Chain', 'Charms'],
    dimensions: '14.0" choker length with 3.0" extender.',
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    colors: ['Soft Pink', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 8,
    sku: 'MS-NK-001',
    rating: 5.0,
    reviewsCount: 31,
    tags: ['Romantic', 'Pink Beads', 'Statement', 'Choker', 'Necklace'],
    careInstructions: 'Store hung or in a pouch to prevent chain tangles.',
    inStock: true
  },
  {
    id: 'emerald-flora-earrings',
    slug: 'emerald-flora-beaded-drops',
    name: 'Emerald Flora Beaded Drops',
    category: 'Earrings',
    price: 1350,
    compareAtPrice: 1600,
    originalPrice: 1600,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP'
    ],
    description: 'Hand-woven cascading beaded earrings with rich emerald-green glass crystals, tiny seed beads, and gold-tone ear hooks. Remarkably lightweight for all-day wear.',
    shortDescription: 'Hand-woven green glass beads with gold-tone ear hooks.',
    materials: ['Beads', 'Gold-Tone Hardware'],
    dimensions: 'Drop length: 2.2 inches. Weight: 4g per pair.',
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    colors: ['Emerald Green', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 15,
    sku: 'MS-ER-001',
    rating: 4.9,
    reviewsCount: 17,
    tags: ['Earrings', 'Floral', 'Handwoven', 'Green', 'Dangle', 'Beaded Earrings'],
    careInstructions: 'Lightweight and comfortable for all-day wear.',
    inStock: true
  },
  {
    id: 'solstice-beaded-ring-set',
    slug: 'solstice-stacking-rings-set-of-3',
    name: 'Solstice Stacking Rings (Set of 3)',
    category: 'Rings',
    price: 1150,
    compareAtPrice: 1400,
    originalPrice: 1400,
    image: HERO_IMAGES.circle,
    images: [
      HERO_IMAGES.circle,
      HERO_IMAGES.arch
    ],
    description: 'A curated trio of stretch micro-bead rings with miniature glass seed beads, acrylic pearl accents, and gold-tone spacer beads. Wear together or stack across fingers.',
    shortDescription: 'Trio of stretch micro-bead rings with colorful glass seed beads and gold-tone accents.',
    materials: ['Beads', 'Gold-Tone Hardware'],
    dimensions: 'Sizes: US 6, 7, 8 (comfortable elastic stretch).',
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    colors: ['Multi-color', 'Gold'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone'],
    stock: 20,
    sku: 'MS-RG-001',
    rating: 4.9,
    reviewsCount: 28,
    tags: ['Ring Set', 'Stackable', 'Micro Beads', 'Glass Beads', 'Rings'],
    careInstructions: 'Roll gently onto fingers rather than pulling.',
    inStock: true
  },
  {
    id: 'bespoke-initial-charm-bracelet',
    slug: 'bespoke-initial-charm-bracelet',
    name: 'Bespoke Custom Initial & Beaded Bracelet',
    category: 'Custom Pieces',
    price: 2150,
    compareAtPrice: 2500,
    originalPrice: 2500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ'
    ],
    description: 'Create your personalized keepsake piece! Customized with your chosen colorful glass beads, metallic letter initial charm, and exact wrist measurements.',
    shortDescription: 'Handcrafted personalized bracelet with colorful glass beads and initial charm.',
    materials: ['Beads', 'Gold-Tone Hardware', 'Charms'],
    dimensions: 'Tailored to your exact requested wrist size (5.5" to 8.5").',
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    colors: ['Custom Hues', 'Gold/Silver'],
    finish: 'Gold-Tone',
    availableFinishes: ['Gold-Tone', 'Silver-Tone'],
    stock: 50,
    sku: 'MS-CUST-001',
    rating: 5.0,
    reviewsCount: 84,
    tags: ['Custom', 'Personalized', 'Initial Charm', 'Gift', 'Beads'],
    careInstructions: 'Individually crafted with love in 48 hours.',
    inStock: true
  }
];

export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUe5xVK7xEFG6rRlr9Uc8x0cnfclRYDjT00f40GBKwrUWw_daNFeBweBMiI2xE-UQys-RA9G3d865JZwNg0_Mh7ICBECQ3OQE-uKe-wml6uig6zV-IgeMvJ3Jzf6Or6uPQC0r5m9MFzVviEpjaG9czyKnz9Z04z3xAPsGpz8o4w7QFZWjn21MiIZ0AOBttaQQm4fw8jgXPcNw9nHf9ohyWbMdzhwufhIfcZg-84lFxuoeJ-6WruEir',
    likes: 342,
    caption: 'Packing your custom wedding order with so much love today 🕊️✨ Each box is wrapped by hand.',
    handle: '@maryamsparkle456',
    productTag: 'Pearl Drop Bracelet'
  },
  {
    id: 'ig-2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1mFLIHyB397OGgT7iy-qohMJlGy7quNovH2SoOrUtmikEl_JY9Xo2qaI7cAEtw-54sLr2hVO1i1-RdPnpF2FDgS7Y_rznyXOnAUPcd6gdf4yuyoLBRWDAW6hJ5Nvrz8_HYfamg46qAyLOpbvuHaULlrO-SPHOfBHz1ci6NJi5M-1ue2oiGtdO3f3V0wjT9fWG0zd-HUC_eQq5wHcsLcqRK2BQQ8P-roHKEVIjHLs7N0_FMMkBbC_y',
    likes: 489,
    caption: 'Afternoon coffee and sketching new botanical charm ideas in the studio ☕🌿',
    handle: '@maryamsparkle456'
  },
  {
    id: 'ig-3',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAootTjGXkyCCxbnu0mqbNYoY9sqfPubHfAS-HGngG9WMBn2wRioSO_d981iKoOqeu7N6uSv6_swKNBHxJnyAOkWl-wHjUs_N3DWninEyMiDD9jY6Af0bWDHzwRJgu6q0h8hrfd-NsxAxA0kKCluorzQN10EaufzD61wCiFdu-o-F9359wLkJ3qzC5Nk7ePS1xpi1xr0I0ONVpXH72HVuWsFne82fByH7IP_uT4DlRoQLKNbRmwDKsG',
    likes: 612,
    caption: 'Sunset hues captured in our new Ruby Star and Crimson collections 🌅 Pure handcrafted magic.',
    handle: '@maryamsparkle456',
    productTag: 'Ruby Star Bracelet'
  },
  {
    id: 'ig-4',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbqP5282WayZLIoQvlekSXSYYjHkdoaLWiEEtdyIcjq1NNsr0x5RSC89_XzPsudVZamIzHusxCRp0a5RfKiqqc62b8M0pv-4v29Meqypbo2v1EAyUiTI6GD1UNr8CproveEGXyT3dUu7779r9jrkkhd5vfHNzq1MJxaWMunbAtNTHaDX_x2Db-IEfENnVd_CMd59ZidqR30UPu4EPj2SQhKnvTAra9nY3QNMBeLm9jJBiezQBqnNBA',
    likes: 520,
    caption: 'Golden hour strolls with our Green Charm stack. Which stack is your daily favorite? 🌿💫',
    handle: '@maryamsparkle456',
    productTag: 'Green Charm Bracelet'
  },
  {
    id: 'ig-5',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHHb587nDTmqlTBbRZlp6xhO9deT8E6oFHbL80EJ-3XMLn8NEV4rcvt3w8qDkm1fTnCY1Yc6QpS3dh8n0RjWA_PwOssywDDmpTtUfvcLFZDIGIYJzPaR_8p2l-OEkB23kjn81A4nhWI9QZripSxNFAP3yRtpwnDkwtN6IiBhfNwhRr17Od1ExCd5dJt3Z8i9ffJ8BYdb-xkeQd3c2fb00Y0iiurXswW5pP5of6lhP_pyaipxZLEwRI',
    likes: 418,
    caption: 'Workshop table flatlay: colorful glass beads sorted by shade and mood boards 🎨✨',
    handle: '@maryamsparkle456'
  },
  {
    id: 'ig-6',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0tM5QumE6FTHncCM2rSy-WTHTLmkU9P-PfLwQeIzXvfSQLO7puOsR18L993DlruCpNzUzjRVgyTu1IchOKQiw0xT4G56xgqCL1Jb8FdUU6ob9ng0imrcjsmiadVfw3smFO91nSFH5XXO1QqGG9ACvYPUdFPepLVx5TVAu7Uf3ljg2EQaItAMc67Jyoc-IHuwpZpv30gNp6KTh9U9NGpkfiWat898AYUFSFnnwVCuSCU_yLQ2QyK5V',
    likes: 388,
    caption: 'Studio desk vibes early morning. Creating peace one bead at a time ✨💻',
    handle: '@maryamsparkle456'
  },
  {
    id: 'ig-7',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi_pap-VNL7uSPVfy-6CgsnROWVaOJpx-QaTWo42oaJT-QMi9f2CJiEw9MgluK941Pz-ZRN3xFhLhwIW3GisTa0HqXJBzw4fWawtjFhc-sWRR-LA55Nj3zLQobxifmZqhgagHsoRxOA9qqLylD0udhbawclxPNmg3cE9ERw6HgvrHtH4yLM-c7ta2pnQnXLyL1P56OL5fttameWKqYIbJe9w9i4mnytpPxozE6m0hJhRl3Iw6h1JfC',
    likes: 567,
    caption: 'Spotted in the mountains with our Midnight Bead piece. Earthy textures everywhere ⛰️',
    handle: '@maryamsparkle456',
    productTag: 'Midnight Bead Bracelet'
  },
  {
    id: 'ig-8',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiiaZCIjv_HudQnTY1mc02zaM6M8IKAXsxZw4gnijX-ycnF7Son3efC4jjEzVkVY2v0Wks6Zd3zv06Zdy-MtHND4BliUed7jCLlfFUYJsSdM__a8iYi0mst8Aadyb4uT9keOYW9KbhpBpxOEj9q1NuFQtS_cIqWGBN1MhkMZI18x3fAsTMRwaJBBp1rfjO3L3ptJqGDbcZIigrwBRRVFTWZzf_TiRNgHYOYlNEblwEU-3DRrI8seIT',
    likes: 730,
    caption: 'Weekend brunch with Maryam Sparkle layered essentials. Tag us to be featured! 🥐✨',
    handle: '@maryamsparkle456'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I know my wrist or anklet size?',
    answer: 'Wrap a flexible measuring tape or a string around your wrist/ankle just below the bone. Add 0.5 inches (1.2 cm) for a snug fit or 1.0 inch for a looser drape. Standard bracelet sizes are: Small (6.0"), Medium (6.5"), Large (7.0"). We also craft custom measurements on request at no extra charge!',
    category: 'Orders & Customization'
  },
  {
    id: 'faq-2',
    question: 'Can I request custom bead combinations, names or colors?',
    answer: 'Absolutely! Maryam loves creating bespoke pieces. Click "Custom Bespoke Request" or use our "Ask Maryam" assistant to specify your preferred bead colors, charms, initials, and size.',
    category: 'Orders & Customization'
  },
  {
    id: 'faq-3',
    question: 'How long does shipping take across Pakistan & Internationally?',
    answer: 'Standard domestic delivery takes 2–4 business days across Pakistan (Karachi, Lahore, Islamabad, Faisalabad, Rawalpindi, Peshawar, Quetta). Custom handcrafted orders require 1–2 days to thread and set. Worldwide tracked international shipping takes 7–12 business days.',
    category: 'Shipping & Delivery'
  },
  {
    id: 'faq-4',
    question: 'What payment methods do you accept?',
    answer: 'We support Cash on Delivery (COD) across Pakistan, EasyPaisa, JazzCash mobile accounts, and direct Online Bank Transfer.',
    category: 'Payments & Returns'
  },
  {
    id: 'faq-5',
    question: 'How should I care for my handmade beaded jewelry?',
    answer: 'To ensure long-lasting luster, keep your jewelry away from harsh perfumes, chlorine pools, and lotions. Store pieces in your Maryam Sparkle signature pouch when not in use, and gently wipe with a soft cloth.',
    category: 'Jewelry Care'
  },
  {
    id: 'faq-6',
    question: 'What is your return & exchange policy?',
    answer: 'We offer a 7-day hassle-free exchange or repair policy for any sizing adjustments or defects. Simply reach out via WhatsApp at +92 300 1234567 or email maryamsparkle@gmail.com with your order number.',
    category: 'Payments & Returns'
  }
];
