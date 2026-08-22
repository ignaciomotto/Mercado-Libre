UPDATE listing
SET image_url = CASE image_url
    WHEN '/images/1.jpg' THEN '/images/ece22ea1c4e4c9b338def32a2467271919dcc98ece78f6e54fa726b2e5d4cd07.jpg'
    WHEN '/images/2.jpg' THEN '/images/9a8857012a44e9372a5b7cdee5afc68c6e0eb7ba024a8f8f36768d1a60298c1c.jpg'
    WHEN '/images/3.jpg' THEN '/images/8f76e9fec5dca3253a079021fdb014ad4e280eebae26fa1e6e523a91fcfe721a.jpg'
    WHEN '/images/4.jpg' THEN '/images/43f5810f07136f5255eb1dd09e6a0d864fc98ee938c61db95e438922f410f425.jpg'
    WHEN '/images/5.jpg' THEN '/images/3ca0bfb42e10e4a1b6763b3e994807793006f88f8ee446bdc3c58265a4bd816a.jpg'
    WHEN '/images/6.jpg' THEN '/images/5a67526958e76f86aab168c1a55f3011c0aad18e9c8b424dad105e48fac9ddba.jpg'
    ELSE image_url
END
WHERE image_url IN (
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg',
    '/images/5.jpg',
    '/images/6.jpg'
);