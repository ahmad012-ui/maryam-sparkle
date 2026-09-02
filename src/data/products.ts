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
    tagline: 'Hand-beaded wrists with meaningful gemstones & delicate charms'
  },
  {
    id: 'anklets',
    name: 'Anklets',
    slug: 'anklets',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 8,
    tagline: 'Sun-kissed anklets featuring seaside pearls and golden bells'
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 12,
    tagline: 'Layered crystal chokers and bohemian pendant necklaces'
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 9,
    tagline: 'Lightweight hand-woven beaded drops and mini hoops'
  },
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    image: HERO_IMAGES.collectionPlaceholder,
    itemCount: 7,
    tagline: 'Elastic micro-beaded rings with raw quartz & tiny charms'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'ruby-star-bracelet',
    name: 'Ruby Star Bracelet',
    category: 'Bracelets',
    price: 1850,
    originalPrice: 2200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
    description: 'An enchanting handcrafted bracelet crafted with natural faceted ruby quartz crystal beads and delicate 18k gold-plated star charms. Radiates warmth and elegance.',
    materials: ['Natural Ruby Quartz', '18K Gold Plated Brass', 'Durable Stretch Elastic'],
    isBestSeller: true,
    isNew: true,
    colors: ['Deep Ruby', 'Gold'],
    rating: 4.9,
    reviewsCount: 48,
    tags: ['Handmade', 'Gemstone', 'Star Charm'],
    inStock: true
  },
  {
    id: 'green-charm-bracelet',
    name: 'Green Charm Bracelet',
    category: 'Bracelets',
    price: 1650,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    description: 'Inspired by morning dew in spring gardens. Hand-woven with genuine green aventurine, sage beads, and suspended miniature leaf and flower charms.',
    materials: ['Green Aventurine', 'Pressed Glass Seed Beads', 'Gold Toned Charms'],
    isBestSeller: true,
    isNew: false,
    colors: ['Sage Green', 'Gold'],
    rating: 4.8,
    reviewsCount: 36,
    tags: ['Nature Inspired', 'Botanical', 'Aventurine'],
    inStock: true
  },
  {
    id: 'lavender-glow-bracelet',
    name: 'Lavender Glow Bracelet',
    category: 'Bracelets',
    price: 1750,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4HBZrWH9Oiimxl9HdlyhZfWaEIOkg-V3SRpKujIvMA6evxBAJaLeEIGcvtFV8kZcRVMf_Oyb8cc6TgVNh36fhpLx2hGVIECT02kX969KmFctARxsN5FDg91sfCB09Zq__drZcXn62_9LF9aAcHexANxzafjycdC75NSjqrn37UkaXavBjYPkIO801vI5UBql3PbG81LG3InHwcHbTeXhGAH_M07tcU-LWuWIDAVOZE3XH3hU4SDJe',
    description: 'Soft lilac glass beads paired with natural amethyst rondelles and a delicate tassel drop. Provides a serene touch to everyday wear.',
    materials: ['Natural Amethyst', 'Pastel Glass Beads', 'Silk Thread Tassel'],
    isBestSeller: true,
    isNew: true,
    colors: ['Lavender', 'Silver'],
    rating: 5.0,
    reviewsCount: 29,
    tags: ['Pastel', 'Amethyst', 'Calm'],
    inStock: true
  },
  {
    id: 'crimson-bead-bracelet',
    name: 'Crimson Bead Bracelet',
    category: 'Bracelets',
    price: 1950,
    originalPrice: 2300,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnsG-9lRJOr_UpaYm29t9VFzZpaxJT18BJHhEr9_76iMLiduwcw6FH54bBVKOV-m3jzpwRtbXQBYWUjFoCre8TFDt10QARj13yCQDP3qc2HJv8aYI-gO2rjwH4YiPVvHOMHukBK57wXD0_7b6RvOCFEoMhZT_mfo-iqGCHQmeEPgB_uuE6_Ui4IhFN9VtWRY9vE5z_VGWCQn08HrpABQjmrDAMFLicR4ouSgF-a5n3_yQ8q9kH8qMF',
    description: 'Double-row rich garnet stones accented by brass rondelles. A bold statement piece designed to be stacked or worn solo.',
    materials: ['Garnet Gemstones', 'Brass Rondelles', 'Steel Wire with Lobster Clasp'],
    isBestSeller: true,
    isNew: false,
    colors: ['Crimson Red', 'Antique Gold'],
    rating: 4.9,
    reviewsCount: 52,
    tags: ['Statement', 'Double Layer', 'Garnet'],
    inStock: true
  },
  {
    id: 'pearl-drop-bracelet',
    name: 'Pearl Drop Bracelet',
    category: 'Bracelets',
    price: 1650,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCym3c_VwqfMRpy3_4MFdu0SCPKfw5QcUU-EbMuf55Oi94gxmhoTK6DvIC9NqkyPrnut8FPQBvd9WbDwUMsdZ9daYCP0CEBw5n33CNNUg9Vf6Fewmrujse_GE-rIRWzfZCFbyHwSHJtFNsGE_sSprb1cpDADr9k1-_yCfeDaJG-ama0UAUP6afCNEvDh6unWvuAdhVdPq_tf06BMovavShLoOA0P9QvacYnLf7NQ8S0oIx-JbomFEdZ',
    description: 'Cultured freshwater baroque pearls carefully placed on a delicate 14k gold-filled chain with an adjustable extender.',
    materials: ['Freshwater Baroque Pearls', '14k Gold-Filled Chain', 'Spring Ring Clasp'],
    isBestSeller: true,
    isNew: true,
    colors: ['Ivory Pearl', 'Gold'],
    rating: 4.9,
    reviewsCount: 64,
    tags: ['Freshwater Pearl', 'Classic', 'Bridal'],
    inStock: true
  },
  {
    id: 'midnight-bead-bracelet',
    name: 'Midnight Bead Bracelet',
    category: 'Bracelets',
    price: 1550,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeL5w6Kn_t9TgkM3l6exc_rFM8zYWh3iQg-GspkHNUrv3plhwCY2M23eXHhEnxYkvOnPeIhn8gEXJOsiCf2CtgPHs6PdJMuoVT-PwP4NRYsqrEmgO1l2-fvg5g0tz6WF6PLB1Iv9_0kOtNqfzYMhwIB8TtUcTAF4-ph_HvrjOPRKo1J0ROFFMypxaOOlNaAN1LtWyLUxMQcynYbi81XsIRLTwOTPB562KyUn2nVkUxOeF0HlWe_heP',
    description: 'Matte black onyx stones with a center carved metallic accent bead. Understated, grounded, and universally styled.',
    materials: ['Matte Black Onyx', 'Gunmetal Spacer Beads', 'High Tensile Cord'],
    isBestSeller: true,
    isNew: false,
    colors: ['Matte Black', 'Silver'],
    rating: 4.7,
    reviewsCount: 41,
    tags: ['Onyx', 'Minimalist', 'Unisex'],
    inStock: true
  },
  {
    id: 'sunlit-citrine-anklet',
    name: 'Sunlit Citrine Anklet',
    category: 'Anklets',
    price: 1450,
    image: HERO_IMAGES.circle,
    description: 'Warm golden citrine chips intertwined with dainty brass sun charms and tiny bells that softly chime with each step.',
    materials: ['Raw Citrine Chips', 'Brass Sun Charms', 'Water-Resistant Cord'],
    isBestSeller: false,
    isNew: true,
    colors: ['Golden Amber', 'Gold'],
    rating: 4.9,
    reviewsCount: 19,
    tags: ['Anklet', 'Summer', 'Sun Charm'],
    inStock: true
  },
  {
    id: 'ocean-wave-anklet',
    name: 'Ocean Wave Turquoise Anklet',
    category: 'Anklets',
    price: 1550,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    description: 'Natural turquoise beads combined with tiny sea shells and waterproof wax thread for beach days.',
    materials: ['Turquoise', 'Natural Shell', 'Waxed Cotton Cord'],
    isBestSeller: false,
    isNew: false,
    colors: ['Ocean Teal', 'Sand'],
    rating: 4.8,
    reviewsCount: 22,
    tags: ['Beach', 'Turquoise', 'Bohemian'],
    inStock: true
  },
  {
    id: 'celestial-quartz-necklace',
    name: 'Celestial Rose Quartz Choker',
    category: 'Necklaces',
    price: 2450,
    originalPrice: 2800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmeq-VwhiU435DetS1X3uFs7ftPFTXuoNQPezkt-FDdS5fVi-fWgAQ_3PvJaDU9x4xRw9sw7ru1NTVm_zs5SnnAjgi_E2wg681wIyMw8JV9vSVAfWYzcpF2UkfNK-BMxse2gjK2A1h8e3yxiOCNiD2WAJBuG3Iw-g3MZVUEn1s8s125YRifRsnzPAXqmvTSBCjOEOnUJwZJOSA8TQuT8SgzakSJP9LOMTUZ0VMg55dfVKNyPJBWwEe',
    description: 'A romantic necklace featuring hand-cut rose quartz nuggets, mother of pearl stars, and an artisan hammered clasp.',
    materials: ['Rose Quartz', 'Mother of Pearl', '18K Gold Plated Chain'],
    isBestSeller: false,
    isNew: true,
    colors: ['Soft Pink', 'Gold'],
    rating: 5.0,
    reviewsCount: 31,
    tags: ['Romantic', 'Rose Quartz', 'Statement'],
    inStock: true
  },
  {
    id: 'emerald-flora-earrings',
    name: 'Emerald Flora Beaded Drops',
    category: 'Earrings',
    price: 1350,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjg3XRMb6wLdRZsXq5bkSYwoUFwyvwoR2OsMODh2in0onDVAfObyPentjgSGJdFHqrjI0OQJb1h8AnkSC9FGjBKn3HO-J33OYyAry0EjOjWNjvVeCan6nA7mcH25mWfDXFhyhG2AtLo8OwfAm-gj9bbjKpacz4e9hg-UZZh4SQktZZy1kByqyqp87OvVUQ9nlbBV2yWuShKbhVkjit8wUdSMJMe5MVDPDVLEDUNROkQAWSN9KexJgP',
    description: 'Hand-woven cascading beaded earrings with deep green glass crystals and hypoallergenic surgical steel hooks.',
    materials: ['Emerald Cut Glass', 'Miyuki Delica Beads', 'Hypoallergenic Hooks'],
    isBestSeller: false,
    isNew: true,
    colors: ['Emerald Green', 'Gold'],
    rating: 4.9,
    reviewsCount: 17,
    tags: ['Earrings', 'Floral', 'Handwoven'],
    inStock: true
  },
  {
    id: 'solstice-beaded-ring-set',
    name: 'Solstice Stacking Rings (Set of 3)',
    category: 'Rings',
    price: 1150,
    image: HERO_IMAGES.circle,
    description: 'A curated trio of stretch micro-bead rings with miniature freshwater pearls, carnelian, and 14k gold beads.',
    materials: ['Carnelian', 'Seed Pearls', '14k Gold Filled Beads'],
    isBestSeller: false,
    isNew: true,
    colors: ['Multi-color', 'Gold'],
    rating: 4.9,
    reviewsCount: 28,
    tags: ['Ring Set', 'Stackable', 'Micro Beads'],
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
    caption: 'Sunset hues captured in our new Ruby Star and Crimson collections 🌅 Pure gemstone magic.',
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
    caption: 'Workshop table flatlay: gemstones sorted by chakra and color mood boards 🎨💎',
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
    answer: 'Wrap a flexible measuring tape or a string around your wrist/ankle just below the bone. Add 0.5 inches (1.2 cm) for a snug fit or 1.0 inch for a looser drape. Standard bracelet sizes are: Small (6.0"), Medium (6.5"), Large (7.0"). We also craft custom measurements on request!',
    category: 'Orders & Customization'
  },
  {
    id: 'faq-2',
    question: 'Can I request custom stone combinations or colors?',
    answer: 'Absolutely! Maryam loves creating bespoke pieces. Click "Custom Order" or chat with our "Ask Maryam" assistant to specify your preferred gemstones, charms, initials, and size.',
    category: 'Orders & Customization'
  },
  {
    id: 'faq-3',
    question: 'How long does shipping take across Pakistan & Internationally?',
    answer: 'Standard domestic delivery takes 2–4 business days across Pakistan (Karachi, Lahore, Islamabad, etc.). Custom handcrafted orders require 2 additional days to craft. Worldwide tracked international shipping takes 7–12 business days.',
    category: 'Shipping & Delivery'
  },
  {
    id: 'faq-4',
    question: 'What payment methods are accepted?',
    answer: 'We accept Visa, Mastercard, Direct Bank Transfers, EasyPaisa, JazzCash, and Cash on Delivery (COD) for domestic orders.',
    category: 'Payments'
  },
  {
    id: 'faq-5',
    question: 'How should I care for my handmade beaded jewelry?',
    answer: 'To ensure long-lasting luster, keep your jewelry away from harsh perfumes, chlorine pools, and lotions. Store pieces in your Maryam Sparkle signature pouch when not in use, and gently wipe with a soft cloth.',
    category: 'Jewelry Care'
  }
];
