-- Disaster Zones
INSERT INTO "public"."disaster_zones" 
("id", "name", "active", "eligible_postcodes", "tier_amounts", "budget_cap", "budget_spent", "created_at", "updated_at")
VALUES
('0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'Terengganu Test Flood 2025', true, ARRAY['20000','21500','21800'], '{"0":"50000000","1":"100000000","2":"200000000"}', 2000000000, 100000000, '2026-09-05 06:34:47.135482+00', '2026-09-06 02:49:36.869+00'),
('0x5bbdf8cf6b1d192733c85fe8230680a39129b962cb7d6f2b1f24872f9214b07b', 'Credibility Demo Zone (well-supported)', true, ARRAY['31000','31900'], '{"0":"10000000","1":"20000000","2":"40000000"}', 500000000, 0, '2026-09-04 22:14:46.941904+00', '2026-09-06 02:49:36.701+00'),
('0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'Kampung Test Flood 2026', true, ARRAY['43000','43100','43200'], '{"0":"50000000","1":"100000000","2":"200000000"}', 2000000000, 800000000, '2026-09-02 09:14:35.037684+00', '2026-09-06 02:49:36.647+00'),
('0xe494f46198e7e4b41df2aa4452ced3770f026b550b581389ee37e09e11af3a42', 'Second Test Zone', true, ARRAY['54000','54100'], '{"0":"20000000","1":"40000000","2":"80000000"}', 500000000, 0, '2026-09-04 16:04:58.730346+00', '2026-09-06 02:49:36.819+00'),
('0xe49b94974f86024e7f0b49796c752bbc6ae1af628245a466dae5cf403a97a352', 'Kelantan Test Flood 2025', true, ARRAY['15000','16000','17000'], '{"0":"50000000","1":"100000000","2":"200000000"}', 2000000000, 50000000, '2026-09-04 14:31:11.51456+00', '2026-09-06 02:49:36.751+00');


-- Household Registrations
INSERT INTO "public"."household_registrations" 
("id", "household_id", "zone_id", "postcode", "channel", "tier", "status", "registrar_address", "head_of_household", "claimed", "reference_code_hash", "created_at", "updated_at", "paid_amount", "paid_tx_digest")
VALUES
('0x123520dc64c368bb19d94e3ad16131097a1c8c25e5f65d285088d61dc003745b', '880101-14-5570', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 1, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xb4edd0ada15437dcf5fe632f218e66cb5fde5abd82149f64dee02664009f6392', true, 'd0f4dcc02e75e8189dc6ec154fb4146b0b6a1c5db4d881b91ee59c68e36454d4', '2026-09-04 15:28:14.275501+00', '2026-09-06 02:49:35.631+00', 50000000, 'DLZZNWvievJmT7WWEVHPnCzDZ6anfL3zw8UGBG5eNFrS'),
('0x15ecb6d83813d9458dd3c158c593cfae59afb38647d0bdadc521bd36ab7e435e', 'lim-family', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43200', 0, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '15f615d163dd2c9fda6543be864b28f5fe74ffefee5197c91430246a519d6af3', '2026-09-05 06:47:54.933059+00', '2026-09-06 02:49:36.197+00', null, null),
('0x1fd3175af02104c5970910b5add86337b776b686583659c49c6235053c8d2da7', 'pak-abu', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 2, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab', true, '5067e24b3c5d28dad06859c4bb29d25376e66ff9c4f3f2b37887eea82200d320', '2026-09-05 06:47:38.449795+00', '2026-09-06 02:49:36.461+00', 200000000, '5128MaNJ3VENXyTDoJwwUDUqc45D3sSa5SCKh83tAJbU'),
('0x1fdb5d4a4b446ab807fa6b4ef4233f48db6fb5a5f9e9d5347ff038fbf1c10179', '880101-14-5572', '0xe49b94974f86024e7f0b49796c752bbc6ae1af628245a466dae5cf403a97a352', '15000', 1, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', true, '5f636e09814c32227f7319ccea37bdceadd50450edb93c9823c906a9ebd1e100', '2026-09-04 18:05:44.055511+00', '2026-09-06 02:49:36.047+00', 50000000, '8iGxEibW8znyaQEMzUBsjnN9Zi3AWN1SpRGwZZdGomPU'),
('0x2a5dace8696102b711279f9c84df433b4f34f566192805b7d901471225f693bc', 'UI-TEST-001', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'd7ac2ae075fa4cd369049ab452b380832779994a5eba82dce1d60fff241ab866', '2026-09-02 10:10:45.716156+00', '2026-09-06 02:49:34.833+00', null, null),
('0x32655f2a15d9c0ad7bb8ac8cee6b1391e41b8fcbdd1cb32cddac7f2853100dcb', 'PPS-1788367011146', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 1, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '8cdfb452855db369fad1c81c0c039cba19173aaec135314fc6464ad72a2e93b5', '2026-09-02 16:36:53.521841+00', '2026-09-06 02:49:35.336+00', null, null),
('0x3606a0b14d534a5994deb541ad14e6906dc04235fa7033c0655d4e00babfde74', 'PPS-1788367658001', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 1, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0x73a209d203109be1382a6ef00b2f4086b59bd78e3a436b4fea21ffeacaeb06df', true, '86e4c09e86a8c532f1c7a8c89c610c9b0318ab99721272f25fb00274cb961918', '2026-09-02 16:47:40.041172+00', '2026-09-06 02:49:35.746+00', 100000000, '6DZao7XbvMFV1WEWuHauvpwFVFt24oLQETpLXPMNXAst'),
('0x58523cca56bb2ca5a5c2cbed535fab1e237760377e151b2b303fe33c362c0182', '880101-14-5572', '0xe49b94974f86024e7f0b49796c752bbc6ae1af628245a466dae5cf403a97a352', '15000', 1, 0, 2, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'cbdda7127c7e63a0cc4271c836401a45116ccf0d3be10b8a5f12bf390ae2c50d', '2026-09-04 17:57:54.698725+00', '2026-09-06 02:49:36.522+00', null, null),
('0x60e027568a1877eae6dd0c7ebd41d1eb8bf26f4ea8fa87367390b31a2e4c167c', 'CL-1788367011146', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 1, 2, 0, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '10d11cbb6afb9037cbbf6ca9461f47277251616648b4122c7092b954b6fc6d5d', '2026-09-02 16:36:55.933275+00', '2026-09-06 02:49:35.048+00', null, null),
('0x6f3e46a63cc354d6f320be13576296afc1c6d1e91a39b72f44dd4df6290c8da0', 'COMBINED-1788367024071', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '534f6d7814b89bc92993c38b928d26cf244e151d892267236ed26a9b16537776', '2026-09-02 16:37:18.00295+00', '2026-09-06 02:49:34.946+00', null, null),
('0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0', '880101-14-5574', '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', '20000', 1, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab', true, 'fd3e461fba491959f63212bce51e2b7685bafc07fe30c647e77de9426629fb60', '2026-09-05 06:43:28.088567+00', '2026-09-06 02:49:36.244+00', 50000000, '8DfiY8YWca1A3mXBxSzKZo2Pgi7sigH5FEmW3wfi886D'),
('0x760cf8d4da0dde06b3b39b2b588554368d948d29e3d18aa9e0a2f4b12a94ea20', 'COMBINED-1788356668874', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xf27c98e015742dc2a2f448b3f7f8ace45a65c80c37de458b411aef06f0e6b809', true, '541413d9f33857ab91df5b843b7157a4ef074c86298a1be9ba9a39428d181f1e', '2026-09-02 13:44:30.174466+00', '2026-09-06 02:49:35.104+00', 50000000, '4hFGKn5Kd48MaSmnsW28E6utijpKy5y6Nrr8YWj5SAxo'),
('0x7b4cd4427194558764e967112d2cbb11be76d2479fb08cf27a8be6a812681937', 'mak-siti', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', true, '3103df2a1e78479a5df9b3966dca276b30916c5ad3409a46a0d33b486dfee539', '2026-09-05 06:47:49.742456+00', '2026-09-06 02:49:36.384+00', 50000000, '7onmSeuQLAKtkdFkXAccv92fdomhTzgjWA6zxbnuyZBZ'),
('0x8417c70bfd2c98f4349e6e5130dcfa731b90d7da3e8a8630380908d87ecd0d0d', 'ZONE-FIX-TEST-001', '0xe494f46198e7e4b41df2aa4452ced3770f026b550b581389ee37e09e11af3a42', '54000', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'e209f2f22df1da3fd758e9d3ec1dc66c52754ec32309bad1fdc76536e5cc0de2', '2026-09-04 16:08:16.078101+00', '2026-09-06 02:49:35.184+00', null, null),
('0x8d63073708618a43b5b4a6b95980c3257bab4049388efffcbc5b4257be7b780e', '880101-14-5567', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 1, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xe1109126c2927307e18ad7d63e2c83260f57fbd1f350e15ca099f70c6374ecd3', true, '199e4ed57144b48a2cc49160704741c4c328e464f70bb5a3f8eec612a8dab888', '2026-09-04 14:52:09.017767+00', '2026-09-06 02:49:35.891+00', 100000000, '2ewieWMjYW2yZyYZm9Sug91qbExUgjVGEUtnfsFr2MKn'),
('0x8e4f0f14621c5c9eda350b96bc0e3d95d3741b7dda916f96084d1bf5032fe452', '880101-14-5568', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 1, 1, 2, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'e5ca621ed5eb146e05b44be0b9e7400ee8744927dce11db487efca2050b7876c', '2026-09-04 15:07:33.646427+00', '2026-09-06 02:49:35.996+00', null, null),
('0xa452df8a10d2a51e3846aad8c577a5a63f8c1fb1006174edc3310144f8342910', '880101-14-5579', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', true, '0943f341c9398cf52fbd52a1bddb694ba87ba192b6d6d6cfbb7ee66ad3da6d99', '2026-09-06 02:47:41.626409+00', '2026-09-06 02:49:36.143+00', 50000000, 'EixLTcpHVpMA3zjsbaQVhnCTwnu8QL6jxtbEVczQEyZb'),
('0xb773eb7d7c77e449bba9ece96ddb3f64b8ff37efdadb4d220cb0c86f936df70f', 'mak-minah', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '412af0d9cc82d0f784fe2d75d72b4d99d37c73fe4605243ed439a092bb29ca27', '2026-09-04 15:40:52.844153+00', '2026-09-06 02:49:34.706+00', null, null),
('0xc11517df0b13f776151c514cc57bcc1ca6301e8c5306cc9e15880f3c43307217', 'CL-1788343353890', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 1, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '3760835830be7bd791dc7a885b828160ce195c66e3cb636c2f8f5ae0d091836a', '2026-09-02 10:02:40.185788+00', '2026-09-06 02:49:35.448+00', null, null),
('0xcc132ef7371a8d7db4d7b643e6f949c3c8de47ecc4a538da4e9e9d05bfd6f543', 'encik-rahman', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'e60247fcd83994e761805c02d1a36c099dd5a0827b9bdcb1d1ca0a2244c4dda3', '2026-09-02 15:43:40.990537+00', '2026-09-06 02:49:35.939+00', null, null),
('0xe35922c96d36d73c2ddec9f2f464bc007ae52f33ef5a0cd45ba854f4a22157f2', 'COMBINED-1788356507926', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xe4f5be5daab845ca397120a1c42787a493481992f85115c69f0a911f308c09c7', true, '73803471887f1e6b4009779605d64b0c58c149dac78881a6cc43ff52a9135c30', '2026-09-02 13:41:49.245556+00', '2026-09-06 02:49:35.507+00', null, null),
('0xe5e95b7515d40c71ddf2f78bcc3420cab7f4016915c5bda4f3dec858438102d9', 'CL-1788367658001', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 1, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, 'e34dc9685cba50b293bc13c39537d888962f8c8c8c8188c8638cf24e9121531e', '2026-09-02 16:47:43.785074+00', '2026-09-06 02:49:34.767+00', null, null),
('0xe5f1765b0b558b2cee28a41b28f20f70c853c5fd88b912741319f7dc4840d2e4', 'AITRIAGE-1788363467935', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43200', 1, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '70cc569f99ce7a033838070f688c5b4a004ec72904263b2c8e9f4d333f03f9bb', '2026-09-02 15:37:50.704319+00', '2026-09-06 02:49:35.807+00', null, null),
('0xe884df32dcc5e42913158aa952fc4e1ff127a99c126a8d194f6a1641d74adf24', 'PPS-1788343353890', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 1, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xb809509503870184ec5aeafedabf30b636880e2199dde631553fb4e5a62d3a01', true, '7e351ead9e73b9afc5cf17e00ffb63600dec46c145152becfb0eb7a04c11d341', '2026-09-02 10:02:37.230166+00', '2026-09-06 02:49:35.258+00', 100000000, 'DaU4SahPmrpXLamoqHodgqh9RXnjsHGC8YvChMrurjRk'),
('0xe8a30ec3447f4f3908be8632ea494620178507888892f97e37efaffa06a4e334', '880101-14-5573', '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', '20000', 0, 0, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab', true, '7e62092760dac0dd647b639072f26df61226a7ad6dcde6487e411f5a31d2e373', '2026-09-05 06:41:31.407379+00', '2026-09-06 02:49:36.3+00', 50000000, '3v3oDE5PQChRkNExaUcUNMM66eTdN54WTq8UCCHhZVrd'),
('0xf633c52076e70b4e418e247f70d89e78e18a671ceaa99cdc5bf2d8aa2fcfb5cc', 'pak-ali-hassan', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43000', 0, 1, 3, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', true, 'e8c74a8e458790f3857162079065ae5137e4a566a273c0983105403768d1cac0', '2026-09-04 15:40:37.30645+00', '2026-09-06 02:49:34.996+00', 100000000, 'FjDgWxGig9kdeLHqSZEaUXGrMQnvNkqbq5VCtvmohgn2'),
('0xfef524e96f06c9e5a42c28cbb50bde1fdb2195c09e9cf54a4691c1c096f3a4b7', 'the-tan-family', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43200', 0, 2, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', null, false, '663349abbca7375e4e7ea48f99d7c6851a5bd333a94b50c452f357b8aa3d2ede', '2026-09-04 15:42:00.129818+00', '2026-09-06 02:49:34.884+00', null, null),
('0xff01449df65c1587dc7a4577258bf3f1a3fecf42fb62c539b11543afc21de919', 'COMBINED-1788367039341', '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '43100', 0, 0, 1, '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', '0x9852e122615b6669b4f3546280e26c56db8e0002e9d5d8658843329a05c7d621', true, '6ff062ba2c68ea2d69cdb506e87a083f6d4af5fc640663ab44e06aa99ef88826', '2026-09-02 16:37:21.546302+00', '2026-09-06 02:49:35.557+00', null, null);


-- Donations
INSERT INTO "public"."donations"
("id", "treasury_id", "donor_address", "amount", "coin_type", "tx_digest", "created_at", "event_seq")
VALUES
(1, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x8249652a6c10ff8f7fb22f16cf45a78996f933e8f08644475c521abea0e53471', 20000000, 'SUI', '9ecUHQ1VYL9pnM442iJakZMBLYgGShfXKuWS1DybxDEB', '2026-09-02 09:41:39.564875+00', '9ecUHQ1VYL9pnM442iJakZMBLYgGShfXKuWS1DybxDEB:0'),
(2, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xe4f5be5daab845ca397120a1c42787a493481992f85115c69f0a911f308c09c7', 30000000, 'SUI', 'BJ8D8wn2hmo5Ha7oURghbkMgANqMyVRz2hte9pQLJxEc', '2026-09-02 13:41:46.577882+00', 'BJ8D8wn2hmo5Ha7oURghbkMgANqMyVRz2hte9pQLJxEc:0'),
(3, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xf27c98e015742dc2a2f448b3f7f8ace45a65c80c37de458b411aef06f0e6b809', 30000000, 'SUI', '4FVXJ1acGoAka4stLpNyf4nz1u7jGfFiRKyPBBqj3FPq', '2026-09-02 13:44:27.734575+00', '4FVXJ1acGoAka4stLpNyf4nz1u7jGfFiRKyPBBqj3FPq:0'),
(4, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xbfae0b4de57037f5cc11eca8fe154efe97991d5a6ae92a6734aa04f608fe2734', 20000000, 'SUI', '2PYdbxoyPSzocFuVLY8iZTrUPmFokZyS7weB9z6jWLrt', '2026-09-02 16:36:29.16936+00', '2PYdbxoyPSzocFuVLY8iZTrUPmFokZyS7weB9z6jWLrt:0'),
(5, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x9735ff0291bb5f4f9fb76761ae828b417f19da1cc31d68d86cb3a972e0861e7b', 30000000, 'SUI', '8YvbN7BeWK3iVfBBCdzV3sNdPgiJyFop1xbBksL1yg6S', '2026-09-02 16:37:02.22925+00', '8YvbN7BeWK3iVfBBCdzV3sNdPgiJyFop1xbBksL1yg6S:0'),
(6, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x9852e122615b6669b4f3546280e26c56db8e0002e9d5d8658843329a05c7d621', 30000000, 'SUI', 'DqjUwDwbg9GT9YcFrUkm8fyhVX129ARB9zsQ3zRsLXxg', '2026-09-02 16:37:17.8227+00', 'DqjUwDwbg9GT9YcFrUkm8fyhVX129ARB9zsQ3zRsLXxg:0'),
(7, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x3f27613945f2f6f7087aa92f512aaf84bf05b65c4502e2d4aba5f72144a57146', 50000000, 'SUI', 'DDoR289ZdGJ6FcN7FmsoqrDSCNR2up4ZYG1kAkpU7NLb', '2026-09-04 14:34:54.679711+00', 'DDoR289ZdGJ6FcN7FmsoqrDSCNR2up4ZYG1kAkpU7NLb:0'),
(8, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x3f27613945f2f6f7087aa92f512aaf84bf05b65c4502e2d4aba5f72144a57146', 50000000, 'SUI', 'BTauBGXtFdGTfstDU9QvEB1mXv4Xwx8gupU39455vpkr', '2026-09-04 14:47:10.82352+00', 'BTauBGXtFdGTfstDU9QvEB1mXv4Xwx8gupU39455vpkr:0'),
(9, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xe1109126c2927307e18ad7d63e2c83260f57fbd1f350e15ca099f70c6374ecd3', 100000000, 'SUI', 'rjUypSn6d7XfvEYFNoGSD53ZJE43SEpipzby8ikukza', '2026-09-04 15:03:00.711486+00', 'rjUypSn6d7XfvEYFNoGSD53ZJE43SEpipzby8ikukza:0'),
(10, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', 50000000, 'SUI', 'F3baCveFfVtZrvMd6fLLQZt7vRyP96DfH6a8gSnWapen', '2026-09-04 15:42:50.18168+00', 'F3baCveFfVtZrvMd6fLLQZt7vRyP96DfH6a8gSnWapen:0'),
(11, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab', 50000000, 'SUI', 'DazDjcJHqk1qtbqmrXkVr7ieVgMMeYehwYYKmwcCxK96', '2026-09-05 06:41:31.143061+00', 'DazDjcJHqk1qtbqmrXkVr7ieVgMMeYehwYYKmwcCxK96:0'),
(12, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', 10000000, 'SUI', '3AQiH9syDExNQSSZD1qdmWL8ewFKxW8DbvpmT3BbvTGy', '2026-09-06 02:35:51.499353+00', '3AQiH9syDExNQSSZD1qdmWL8ewFKxW8DbvpmT3BbvTGy:0'),
(13, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', 100000000, 'SUI', '8SRRXzAmDdZGM3eoURJ3Uw1ohHiq246D7Qc6DegYxSpR', '2026-09-06 02:48:52.631156+00', '8SRRXzAmDdZGM3eoURJ3Uw1ohHiq246D7Qc6DegYxSpR:0'),
(14, '0xf38fb4c8d6ffc54ea26e6bea884672c7cdf32f941c1f123b9cad92d3d9edfd5e', '0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf', 100000000, 'SUI', 'HGyaMTc5h7dEyW7Kv2e9S2KeW6cEWxCNQgZTKMxprxuS', '2026-09-06 02:49:34.255312+00', 'HGyaMTc5h7dEyW7Kv2e9S2KeW6cEWxCNQgZTKMxprxuS:0');


-- AI Recommendations
INSERT INTO "public"."ai_recommendations"
("id", "registration_id", "gonka_request_id", "recommendation", "confidence", "reasoning", "created_at")
VALUES
(1, '0xe5f1765b0b558b2cee28a41b28f20f70c853c5fd88b912741319f7dc4840d2e4', 'req-1788363474527618341-188028', 'approve', '1.000', 'All checks pass: postcode 43200 is in zone''s eligible postcodes, zone is active, tier has payout amount, and no duplicate household registrations. Registration is internally consistent.', '2026-09-02 15:37:58.730906+00'),
(2, '0xe5f1765b0b558b2cee28a41b28f20f70c853c5fd88b912741319f7dc4840d2e4', 'req-1788363587321951984-188505', 'approve', '1.000', 'All checks pass: postcode 43200 is in zone''s eligible postcodes, zone is active, tier has payout amount, and no duplicate household registrations. Registration is internally consistent.', '2026-09-02 15:39:48.409352+00'),
(3, '0x8e4f0f14621c5c9eda350b96bc0e3d95d3741b7dda916f96084d1bf5032fe452', 'req-1788534932130466702-849384', 'approve', '1.000', 'All checks pass: postcode 43000 is eligible, zone is active, tier has payout, no duplicate household registrations. Registration is internally consistent.', '2026-09-04 15:15:55.575731+00'),
(4, '0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0', 'req-1788590648195942287-1078665', 'approve', '0.950', 'All checks pass: postcode eligible, zone active, tier has payout, no duplicate registrations. Channel lacks auto-verification but no rule violation indicated.', '2026-09-05 06:44:12.185293+00');


-- Event Logs
INSERT INTO "public"."events_log"
("id", "event_type", "object_id", "tx_digest", "raw_payload", "created_at", "event_seq")
VALUES
(1, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '9ecUHQ1VYL9pnM442iJakZMBLYgGShfXKuWS1DybxDEB', '{"donor":"0x8249652a6c10ff8f7fb22f16cf45a78996f933e8f08644475c521abea0e53471","amount":"20000000"}', '2026-09-02 09:41:39.456513+00', '9ecUHQ1VYL9pnM442iJakZMBLYgGShfXKuWS1DybxDEB:0'),
(2, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'CZTfWrVMvGv8KkEc1emDypnCHxhMECE1wkxQZHUpQv7R', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"PPS-1788343353890","registration_id":"0xe884df32dcc5e42913158aa952fc4e1ff127a99c126a8d194f6a1641d74adf24"}', '2026-09-02 10:02:36.861228+00', 'CZTfWrVMvGv8KkEc1emDypnCHxhMECE1wkxQZHUpQv7R:0'),
(3, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '4QZX8nqGMu8MeAVCgcdz1ZaFzEnZecNNfcv55N61G5kU', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"CL-1788343353890","registration_id":"0xc11517df0b13f776151c514cc57bcc1ca6301e8c5306cc9e15880f3c43307217"}', '2026-09-02 10:02:40.03281+00', '4QZX8nqGMu8MeAVCgcdz1ZaFzEnZecNNfcv55N61G5kU:0'),
(4, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, 'GUXa2eQGp9H6tk2uQxdipD4xxPtGKyWiuL6qKd5xcvSd', '{"registration_id":"0xc11517df0b13f776151c514cc57bcc1ca6301e8c5306cc9e15880f3c43307217"}', '2026-09-02 10:08:33.73803+00', 'GUXa2eQGp9H6tk2uQxdipD4xxPtGKyWiuL6qKd5xcvSd:0'),
(5, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '9SrWPHcuAM9ZQPhsBJDdCLvoCUhZN2sGeq7bVKNBJUGU', '{"registration_id":"0xe884df32dcc5e42913158aa952fc4e1ff127a99c126a8d194f6a1641d74adf24","head_of_household":"0xb809509503870184ec5aeafedabf30b636880e2199dde631553fb4e5a62d3a01"}', '2026-09-02 10:08:38.136359+00', '9SrWPHcuAM9ZQPhsBJDdCLvoCUhZN2sGeq7bVKNBJUGU:0'),
(6, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, 'DaU4SahPmrpXLamoqHodgqh9RXnjsHGC8YvChMrurjRk', '{"amount":"100000000","registration_id":"0xe884df32dcc5e42913158aa952fc4e1ff127a99c126a8d194f6a1641d74adf24","head_of_household":"0xb809509503870184ec5aeafedabf30b636880e2199dde631553fb4e5a62d3a01"}', '2026-09-02 10:08:40.105054+00', 'DaU4SahPmrpXLamoqHodgqh9RXnjsHGC8YvChMrurjRk:0'),
(7, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'P6oVRK1oh6FBYdnrs9FKBXdrXtHX9X6MHPFAcb1NNFr', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"UI-TEST-001","registration_id":"0x2a5dace8696102b711279f9c84df433b4f34f566192805b7d901471225f693bc"}', '2026-09-02 10:10:45.395984+00', 'P6oVRK1oh6FBYdnrs9FKBXdrXtHX9X6MHPFAcb1NNFr:0'),
(8, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'BJ8D8wn2hmo5Ha7oURghbkMgANqMyVRz2hte9pQLJxEc', '{"donor":"0xe4f5be5daab845ca397120a1c42787a493481992f85115c69f0a911f308c09c7","amount":"30000000"}', '2026-09-02 13:41:46.47217+00', 'BJ8D8wn2hmo5Ha7oURghbkMgANqMyVRz2hte9pQLJxEc:0'),
(9, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '3PaQvWZTtR4cFg7KH7KhFm5b44FH8K9JYUENDrvr8T3s', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"COMBINED-1788356507926","registration_id":"0xe35922c96d36d73c2ddec9f2f464bc007ae52f33ef5a0cd45ba854f4a22157f2"}', '2026-09-02 13:41:49.052165+00', '3PaQvWZTtR4cFg7KH7KhFm5b44FH8K9JYUENDrvr8T3s:0'),
(10, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'BPh8FXY7iUkXajr1RBZcACJqWPMoxJhdpwVozCs9GxZ7', '{"registration_id":"0xe35922c96d36d73c2ddec9f2f464bc007ae52f33ef5a0cd45ba854f4a22157f2","head_of_household":"0xe4f5be5daab845ca397120a1c42787a493481992f85115c69f0a911f308c09c7"}', '2026-09-02 13:41:52.270574+00', 'BPh8FXY7iUkXajr1RBZcACJqWPMoxJhdpwVozCs9GxZ7:0'),
(11, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '4FVXJ1acGoAka4stLpNyf4nz1u7jGfFiRKyPBBqj3FPq', '{"donor":"0xf27c98e015742dc2a2f448b3f7f8ace45a65c80c37de458b411aef06f0e6b809","amount":"30000000"}', '2026-09-02 13:44:27.60766+00', '4FVXJ1acGoAka4stLpNyf4nz1u7jGfFiRKyPBBqj3FPq:0'),
(12, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '3WBz8rpabLoyzq3HZfRdrVp3JB1Zgk1JdhW7SJzR96QX', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"COMBINED-1788356668874","registration_id":"0x760cf8d4da0dde06b3b39b2b588554368d948d29e3d18aa9e0a2f4b12a94ea20"}', '2026-09-02 13:44:29.969517+00', '3WBz8rpabLoyzq3HZfRdrVp3JB1Zgk1JdhW7SJzR96QX:0'),
(13, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '6PhcApKeLuA4inYvXFjeZwfLXtgL9pLaC8wW4hKvvcyd', '{"registration_id":"0x760cf8d4da0dde06b3b39b2b588554368d948d29e3d18aa9e0a2f4b12a94ea20","head_of_household":"0xf27c98e015742dc2a2f448b3f7f8ace45a65c80c37de458b411aef06f0e6b809"}', '2026-09-02 13:44:33.201124+00', '6PhcApKeLuA4inYvXFjeZwfLXtgL9pLaC8wW4hKvvcyd:0'),
(14, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '4hFGKn5Kd48MaSmnsW28E6utijpKy5y6Nrr8YWj5SAxo', '{"amount":"50000000","registration_id":"0x760cf8d4da0dde06b3b39b2b588554368d948d29e3d18aa9e0a2f4b12a94ea20","head_of_household":"0xf27c98e015742dc2a2f448b3f7f8ace45a65c80c37de458b411aef06f0e6b809"}', '2026-09-02 13:48:59.967837+00', '4hFGKn5Kd48MaSmnsW28E6utijpKy5y6Nrr8YWj5SAxo:0'),
(15, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '9uhRJU2XBeHj9ZobzgkkyFaGtxEupv6yqgmuoXFs89fv', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"AITRIAGE-1788363467935","registration_id":"0xe5f1765b0b558b2cee28a41b28f20f70c853c5fd88b912741319f7dc4840d2e4"}', '2026-09-02 15:37:50.422728+00', '9uhRJU2XBeHj9ZobzgkkyFaGtxEupv6yqgmuoXFs89fv:0'),
(16, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, '4HHX8HtnWHbj17oLzt5tpLF3aqANsre3Ai3YvzTraZ1h', '{"registration_id":"0xe5f1765b0b558b2cee28a41b28f20f70c853c5fd88b912741319f7dc4840d2e4"}', '2026-09-02 15:40:10.206395+00', '4HHX8HtnWHbj17oLzt5tpLF3aqANsre3Ai3YvzTraZ1h:0'),
(17, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '5Uz7KutRZ1KQKyu2Y1QyqesgJcy8Xp591n4Cm9sS13Br', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"encik-rahman","registration_id":"0xcc132ef7371a8d7db4d7b643e6f949c3c8de47ecc4a538da4e9e9d05bfd6f543"}', '2026-09-02 15:43:40.791859+00', '5Uz7KutRZ1KQKyu2Y1QyqesgJcy8Xp591n4Cm9sS13Br:0'),
(18, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '2PYdbxoyPSzocFuVLY8iZTrUPmFokZyS7weB9z6jWLrt', '{"donor":"0xbfae0b4de57037f5cc11eca8fe154efe97991d5a6ae92a6734aa04f608fe2734","amount":"20000000"}', '2026-09-02 16:36:29.056284+00', '2PYdbxoyPSzocFuVLY8iZTrUPmFokZyS7weB9z6jWLrt:0'),
(19, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '3g2stNNFXgRns1qhtTXt7YU1vWYLxjxW1rVT2RQepJhN', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"PPS-1788367011146","registration_id":"0x32655f2a15d9c0ad7bb8ac8cee6b1391e41b8fcbdd1cb32cddac7f2853100dcb"}', '2026-09-02 16:36:53.282385+00', '3g2stNNFXgRns1qhtTXt7YU1vWYLxjxW1rVT2RQepJhN:0'),
(20, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'EBY4zaUhkKzSLryxsFvkdcDnu1SYP8kbRwtTC5YWL2gg', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"CL-1788367011146","registration_id":"0x60e027568a1877eae6dd0c7ebd41d1eb8bf26f4ea8fa87367390b31a2e4c167c"}', '2026-09-02 16:36:55.735855+00', 'EBY4zaUhkKzSLryxsFvkdcDnu1SYP8kbRwtTC5YWL2gg:0'),
(21, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '8YvbN7BeWK3iVfBBCdzV3sNdPgiJyFop1xbBksL1yg6S', '{"donor":"0x9735ff0291bb5f4f9fb76761ae828b417f19da1cc31d68d86cb3a972e0861e7b","amount":"30000000"}', '2026-09-02 16:37:02.179367+00', '8YvbN7BeWK3iVfBBCdzV3sNdPgiJyFop1xbBksL1yg6S:0'),
(22, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '8jEa51pFSTfzH4n5EPMKY7E6asCYHCmw6Zx6piWwZZ9p', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"COMBINED-1788367024071","registration_id":"0x6f3e46a63cc354d6f320be13576296afc1c6d1e91a39b72f44dd4df6290c8da0"}', '2026-09-02 16:37:17.714848+00', '8jEa51pFSTfzH4n5EPMKY7E6asCYHCmw6Zx6piWwZZ9p:0'),
(23, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'DqjUwDwbg9GT9YcFrUkm8fyhVX129ARB9zsQ3zRsLXxg', '{"donor":"0x9852e122615b6669b4f3546280e26c56db8e0002e9d5d8658843329a05c7d621","amount":"30000000"}', '2026-09-02 16:37:17.779386+00', 'DqjUwDwbg9GT9YcFrUkm8fyhVX129ARB9zsQ3zRsLXxg:0'),
(24, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '84GXsqXA1kgRBN9FLk6pPaAJvcvBBSybHsHrfjeQBanf', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"COMBINED-1788367039341","registration_id":"0xff01449df65c1587dc7a4577258bf3f1a3fecf42fb62c539b11543afc21de919"}', '2026-09-02 16:37:21.326897+00', '84GXsqXA1kgRBN9FLk6pPaAJvcvBBSybHsHrfjeQBanf:0'),
(25, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'FcCwDKyBJQvCELHiAAtLnJqv9LEDCmCApy4e3MjdxqSB', '{"registration_id":"0xff01449df65c1587dc7a4577258bf3f1a3fecf42fb62c539b11543afc21de919","head_of_household":"0x9852e122615b6669b4f3546280e26c56db8e0002e9d5d8658843329a05c7d621"}', '2026-09-02 16:37:25.017833+00', 'FcCwDKyBJQvCELHiAAtLnJqv9LEDCmCApy4e3MjdxqSB:0'),
(26, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '7fgsUitgWFe6wcHUt5KaMieH4PWMCmSQRMJhHBny51Bs', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"PPS-1788367658001","registration_id":"0x3606a0b14d534a5994deb541ad14e6906dc04235fa7033c0655d4e00babfde74"}', '2026-09-02 16:47:39.769259+00', '7fgsUitgWFe6wcHUt5KaMieH4PWMCmSQRMJhHBny51Bs:0'),
(27, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '8MdaWx67kWGwNi4UUojoQvdTgb58SQANSVwiiGLoz84d', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"CL-1788367658001","registration_id":"0xe5e95b7515d40c71ddf2f78bcc3420cab7f4016915c5bda4f3dec858438102d9"}', '2026-09-02 16:47:43.565317+00', '8MdaWx67kWGwNi4UUojoQvdTgb58SQANSVwiiGLoz84d:0'),
(28, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, 'CFxhPcnBirTh2g25jwUFiiwB3M7jyKHLmBe4YPU65Gmk', '{"registration_id":"0xe5e95b7515d40c71ddf2f78bcc3420cab7f4016915c5bda4f3dec858438102d9"}', '2026-09-02 16:47:49.884108+00', 'CFxhPcnBirTh2g25jwUFiiwB3M7jyKHLmBe4YPU65Gmk:0'),
(29, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'DWxFo8DiLeyPxjTgTmQB378xHpvNvCkFeC9QevvdbZKY', '{"registration_id":"0x3606a0b14d534a5994deb541ad14e6906dc04235fa7033c0655d4e00babfde74","head_of_household":"0x73a209d203109be1382a6ef00b2f4086b59bd78e3a436b4fea21ffeacaeb06df"}', '2026-09-02 16:47:54.16854+00', 'DWxFo8DiLeyPxjTgTmQB378xHpvNvCkFeC9QevvdbZKY:0'),
(30, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '6DZao7XbvMFV1WEWuHauvpwFVFt24oLQETpLXPMNXAst', '{"amount":"100000000","registration_id":"0x3606a0b14d534a5994deb541ad14e6906dc04235fa7033c0655d4e00babfde74","head_of_household":"0x73a209d203109be1382a6ef00b2f4086b59bd78e3a436b4fea21ffeacaeb06df"}', '2026-09-02 16:47:57.895638+00', '6DZao7XbvMFV1WEWuHauvpwFVFt24oLQETpLXPMNXAst:0'),
(31, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'DDoR289ZdGJ6FcN7FmsoqrDSCNR2up4ZYG1kAkpU7NLb', '{"donor":"0x3f27613945f2f6f7087aa92f512aaf84bf05b65c4502e2d4aba5f72144a57146","amount":"50000000"}', '2026-09-04 14:34:54.580154+00', 'DDoR289ZdGJ6FcN7FmsoqrDSCNR2up4ZYG1kAkpU7NLb:0'),
(32, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'BTauBGXtFdGTfstDU9QvEB1mXv4Xwx8gupU39455vpkr', '{"donor":"0x3f27613945f2f6f7087aa92f512aaf84bf05b65c4502e2d4aba5f72144a57146","amount":"50000000"}', '2026-09-04 14:47:10.748332+00', 'BTauBGXtFdGTfstDU9QvEB1mXv4Xwx8gupU39455vpkr:0'),
(33, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '395rHnYZ4om4yx9noE98V4uvLdL73BRg27jk1WYCFqT4', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5567","registration_id":"0x8d63073708618a43b5b4a6b95980c3257bab4049388efffcbc5b4257be7b780e"}', '2026-09-04 14:52:08.7027+00', '395rHnYZ4om4yx9noE98V4uvLdL73BRg27jk1WYCFqT4:0'),
(34, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'HooVtTq9yw5Vm5bhTTNy9pQGkGSZcjLx8C2Q7N2GeuVL', '{"registration_id":"0x8d63073708618a43b5b4a6b95980c3257bab4049388efffcbc5b4257be7b780e","head_of_household":"0xe1109126c2927307e18ad7d63e2c83260f57fbd1f350e15ca099f70c6374ecd3"}', '2026-09-04 14:59:46.770366+00', 'HooVtTq9yw5Vm5bhTTNy9pQGkGSZcjLx8C2Q7N2GeuVL:0'),
(35, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '2ewieWMjYW2yZyYZm9Sug91qbExUgjVGEUtnfsFr2MKn', '{"amount":"100000000","registration_id":"0x8d63073708618a43b5b4a6b95980c3257bab4049388efffcbc5b4257be7b780e","head_of_household":"0xe1109126c2927307e18ad7d63e2c83260f57fbd1f350e15ca099f70c6374ecd3"}', '2026-09-04 15:00:12.970334+00', '2ewieWMjYW2yZyYZm9Sug91qbExUgjVGEUtnfsFr2MKn:0'),
(36, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'rjUypSn6d7XfvEYFNoGSD53ZJE43SEpipzby8ikukza', '{"donor":"0xe1109126c2927307e18ad7d63e2c83260f57fbd1f350e15ca099f70c6374ecd3","amount":"100000000"}', '2026-09-04 15:03:00.625515+00', 'rjUypSn6d7XfvEYFNoGSD53ZJE43SEpipzby8ikukza:0'),
(37, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '8FY9BXnECyofc3WiJtKM4iUjXH9t7WAz4bNTmgRd9Wwc', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5568","registration_id":"0x8e4f0f14621c5c9eda350b96bc0e3d95d3741b7dda916f96084d1bf5032fe452"}', '2026-09-04 15:07:33.191353+00', '8FY9BXnECyofc3WiJtKM4iUjXH9t7WAz4bNTmgRd9Wwc:0'),
(38, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationRejected', null, 'H8PFhxp46AbDpq82e6gPmdxNB3foTqG8C6m3ib6aamxp', '{"reason":"Rejected by verifier","registration_id":"0x8e4f0f14621c5c9eda350b96bc0e3d95d3741b7dda916f96084d1bf5032fe452"}', '2026-09-04 15:19:39.467621+00', 'H8PFhxp46AbDpq82e6gPmdxNB3foTqG8C6m3ib6aamxp:0'),
(39, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '49wGt2ZENsDiKxnKBTuK6pfjAUsFLEChdLGZj9jqDt7M', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5568","registration_id":"0xb99667cea39364229096f415dab30b91a039fe3c2cf375b8204bb4416495e43a"}', '2026-09-04 15:20:38.573201+00', '49wGt2ZENsDiKxnKBTuK6pfjAUsFLEChdLGZj9jqDt7M:0'),
(40, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '2Mr7JhXE4ZkLj1z7fgPKHTmSJc2DEEQxRgc5aAvdJGp5', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5570","registration_id":"0x123520dc64c368bb19d94e3ad16131097a1c8c25e5f65d285088d61dc003745b"}', '2026-09-04 15:28:13.974416+00', '2Mr7JhXE4ZkLj1z7fgPKHTmSJc2DEEQxRgc5aAvdJGp5:0'),
(41, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, '6SusJdyPboBp6cKZ3rxrgafkcTXp93182S7GZFj5QtHz', '{"registration_id":"0x123520dc64c368bb19d94e3ad16131097a1c8c25e5f65d285088d61dc003745b"}', '2026-09-04 15:29:26.290535+00', '6SusJdyPboBp6cKZ3rxrgafkcTXp93182S7GZFj5QtHz:0'),
(42, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '9FWDyhGFBQpXQB17q8q61Nwv68scpk49EbqLXYoJEjKf', '{"registration_id":"0x123520dc64c368bb19d94e3ad16131097a1c8c25e5f65d285088d61dc003745b","head_of_household":"0xb4edd0ada15437dcf5fe632f218e66cb5fde5abd82149f64dee02664009f6392"}', '2026-09-04 15:29:48.567946+00', '9FWDyhGFBQpXQB17q8q61Nwv68scpk49EbqLXYoJEjKf:0'),
(43, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, 'DLZZNWvievJmT7WWEVHPnCzDZ6anfL3zw8UGBG5eNFrS', '{"amount":"50000000","registration_id":"0x123520dc64c368bb19d94e3ad16131097a1c8c25e5f65d285088d61dc003745b","head_of_household":"0xb4edd0ada15437dcf5fe632f218e66cb5fde5abd82149f64dee02664009f6392"}', '2026-09-04 15:29:55.442932+00', 'DLZZNWvievJmT7WWEVHPnCzDZ6anfL3zw8UGBG5eNFrS:0'),
(44, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '498uGKuaWJTHsZNxceneFSHA34K4G5tEvdjkWBBYvY9K', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"pak-ali-hassan","registration_id":"0xf633c52076e70b4e418e247f70d89e78e18a671ceaa99cdc5bf2d8aa2fcfb5cc"}', '2026-09-04 15:40:37.037784+00', '498uGKuaWJTHsZNxceneFSHA34K4G5tEvdjkWBBYvY9K:0'),
(45, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'dTzfHAxn1eUzHzb24gjkBh737geLJoiiLSRWjF6Nfzo', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"mak-minah","registration_id":"0xb773eb7d7c77e449bba9ece96ddb3f64b8ff37efdadb4d220cb0c86f936df70f"}', '2026-09-04 15:40:52.623145+00', 'dTzfHAxn1eUzHzb24gjkBh737geLJoiiLSRWjF6Nfzo:0'),
(46, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '8wT7TjpkshNMB3i7yptD3fzf6Z52yf823N44YYcQc3b4', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"the-tan-family","registration_id":"0xfef524e96f06c9e5a42c28cbb50bde1fdb2195c09e9cf54a4691c1c096f3a4b7"}', '2026-09-04 15:41:59.809343+00', '8wT7TjpkshNMB3i7yptD3fzf6Z52yf823N44YYcQc3b4:0'),
(47, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '6a9nhfZa32Xpf2JVJQFcuxPtZbaaQi9pBvXFWPCaKUCK', '{"registration_id":"0xf633c52076e70b4e418e247f70d89e78e18a671ceaa99cdc5bf2d8aa2fcfb5cc","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-04 15:41:59.917535+00', '6a9nhfZa32Xpf2JVJQFcuxPtZbaaQi9pBvXFWPCaKUCK:0'),
(48, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, 'FjDgWxGig9kdeLHqSZEaUXGrMQnvNkqbq5VCtvmohgn2', '{"amount":"100000000","registration_id":"0xf633c52076e70b4e418e247f70d89e78e18a671ceaa99cdc5bf2d8aa2fcfb5cc","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-04 15:42:05.101508+00', 'FjDgWxGig9kdeLHqSZEaUXGrMQnvNkqbq5VCtvmohgn2:0'),
(49, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'F3baCveFfVtZrvMd6fLLQZt7vRyP96DfH6a8gSnWapen', '{"donor":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","amount":"50000000"}', '2026-09-04 15:42:50.09952+00', 'F3baCveFfVtZrvMd6fLLQZt7vRyP96DfH6a8gSnWapen:0'),
(50, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'GC5m6FDV13Ki4iQzgjwA8STEi9pDZvStrXkcVeEtoz26', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"ZONE-FIX-TEST-001","registration_id":"0x8417c70bfd2c98f4349e6e5130dcfa731b90d7da3e8a8630380908d87ecd0d0d"}', '2026-09-04 16:08:15.829953+00', 'GC5m6FDV13Ki4iQzgjwA8STEi9pDZvStrXkcVeEtoz26:0'),
(51, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'D3dPhBWwz7t8rvaTboRFimWsktoKcngPyTzi2JdDWTZZ', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5572","registration_id":"0x58523cca56bb2ca5a5c2cbed535fab1e237760377e151b2b303fe33c362c0182"}', '2026-09-04 17:57:54.456445+00', 'D3dPhBWwz7t8rvaTboRFimWsktoKcngPyTzi2JdDWTZZ:0'),
(52, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationRejected', null, 'Fjd5W1uf4e7nFpAwmmAgVD3ePnnNVEVGZGKZtqJkdf46', '{"reason":"Reject Test 1","registration_id":"0x58523cca56bb2ca5a5c2cbed535fab1e237760377e151b2b303fe33c362c0182"}', '2026-09-04 18:01:04.577173+00', 'Fjd5W1uf4e7nFpAwmmAgVD3ePnnNVEVGZGKZtqJkdf46:0'),
(53, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '4PoBtp7AnrS3gKPNzmavy92SeuLwfpQPjfYtjsjcc4My', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5572","registration_id":"0x1fdb5d4a4b446ab807fa6b4ef4233f48db6fb5a5f9e9d5347ff038fbf1c10179"}', '2026-09-04 18:05:43.818891+00', '4PoBtp7AnrS3gKPNzmavy92SeuLwfpQPjfYtjsjcc4My:0'),
(54, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, 'DpM3r1JswEhvrBBy6UJhoTihHrQy3uabMNPYqerxySbp', '{"registration_id":"0x1fdb5d4a4b446ab807fa6b4ef4233f48db6fb5a5f9e9d5347ff038fbf1c10179"}', '2026-09-04 18:08:01.744008+00', 'DpM3r1JswEhvrBBy6UJhoTihHrQy3uabMNPYqerxySbp:0'),
(55, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'DjcCfUsibjWwTAgsn5jevoDqDyMdnjRWAWNxTNMKEwyy', '{"registration_id":"0x1fdb5d4a4b446ab807fa6b4ef4233f48db6fb5a5f9e9d5347ff038fbf1c10179","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-04 18:12:55.652123+00', 'DjcCfUsibjWwTAgsn5jevoDqDyMdnjRWAWNxTNMKEwyy:0'),
(56, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '8iGxEibW8znyaQEMzUBsjnN9Zi3AWN1SpRGwZZdGomPU', '{"amount":"50000000","registration_id":"0x1fdb5d4a4b446ab807fa6b4ef4233f48db6fb5a5f9e9d5347ff038fbf1c10179","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-04 18:13:23.228961+00', '8iGxEibW8znyaQEMzUBsjnN9Zi3AWN1SpRGwZZdGomPU:0'),
(57, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'DazDjcJHqk1qtbqmrXkVr7ieVgMMeYehwYYKmwcCxK96', '{"donor":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab","amount":"50000000"}', '2026-09-05 06:41:31.035959+00', 'DazDjcJHqk1qtbqmrXkVr7ieVgMMeYehwYYKmwcCxK96:0'),
(58, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'C5Cxi9jSWYV5xKztzvUKfneELvutRv977z7GvbAM7m8w', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5573","registration_id":"0xe8a30ec3447f4f3908be8632ea494620178507888892f97e37efaffa06a4e334"}', '2026-09-05 06:41:31.19974+00', 'C5Cxi9jSWYV5xKztzvUKfneELvutRv977z7GvbAM7m8w:0'),
(59, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '3yZZVFyyhqTQLRigu1YmBzWzXFewT94GcZEQ6n5RLNrT', '{"registration_id":"0xe8a30ec3447f4f3908be8632ea494620178507888892f97e37efaffa06a4e334","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-05 06:42:33.188194+00', '3yZZVFyyhqTQLRigu1YmBzWzXFewT94GcZEQ6n5RLNrT:0'),
(60, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '3v3oDE5PQChRkNExaUcUNMM66eTdN54WTq8UCCHhZVrd', '{"amount":"50000000","registration_id":"0xe8a30ec3447f4f3908be8632ea494620178507888892f97e37efaffa06a4e334","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-05 06:42:39.328494+00', '3v3oDE5PQChRkNExaUcUNMM66eTdN54WTq8UCCHhZVrd:0'),
(61, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'D2VW12AFnk7o4FYxdUsv3Sy9tgNPTDPpzcvfy9htHPWq', '{"channel":1,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5574","registration_id":"0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0"}', '2026-09-05 06:43:27.794654+00', 'D2VW12AFnk7o4FYxdUsv3Sy9tgNPTDPpzcvfy9htHPWq:0'),
(62, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationVerified', null, '85f7jvs1Phjo9HPc8vz3uEtU8n4KaWBPUdstZP5sNn6a', '{"registration_id":"0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0"}', '2026-09-05 06:44:34.687476+00', '85f7jvs1Phjo9HPc8vz3uEtU8n4KaWBPUdstZP5sNn6a:0'),
(63, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'C67yZiHcbiJiSx2mTmKhVLNMxpRFgqS8bLzq2L6Qo7B3', '{"registration_id":"0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-05 06:44:50.990418+00', 'C67yZiHcbiJiSx2mTmKhVLNMxpRFgqS8bLzq2L6Qo7B3:0'),
(64, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '8DfiY8YWca1A3mXBxSzKZo2Pgi7sigH5FEmW3wfi886D', '{"amount":"50000000","registration_id":"0x6f52575b3ea6b4bb2bce1397ac04bbb73131f372083d0ae0c922d227ba702da0","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-05 06:45:02.095456+00', '8DfiY8YWca1A3mXBxSzKZo2Pgi7sigH5FEmW3wfi886D:0'),
(65, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '2U6QbsVp4tUiCJzh8ku9TwChJHa6uHRZK2HdMSvwNsz1', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"pak-abu","registration_id":"0x1fd3175af02104c5970910b5add86337b776b686583659c49c6235053c8d2da7"}', '2026-09-05 06:47:38.210754+00', '2U6QbsVp4tUiCJzh8ku9TwChJHa6uHRZK2HdMSvwNsz1:0'),
(66, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '7gnzwZXBA2dU76nk8E9R4cAbM2dor9YTSmJNEYcK12a8', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"mak-siti","registration_id":"0x7b4cd4427194558764e967112d2cbb11be76d2479fb08cf27a8be6a812681937"}', '2026-09-05 06:47:49.546964+00', '7gnzwZXBA2dU76nk8E9R4cAbM2dor9YTSmJNEYcK12a8:0'),
(67, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, 'DaDbVCSNrQHXwXZjTuhkCFD7qdvMfFHEoLqiX42odX6p', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"lim-family","registration_id":"0x15ecb6d83813d9458dd3c158c593cfae59afb38647d0bdadc521bd36ab7e435e"}', '2026-09-05 06:47:54.733068+00', 'DaDbVCSNrQHXwXZjTuhkCFD7qdvMfFHEoLqiX42odX6p:0'),
(68, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '4RbPTpBEZ7sqVdQCrRDUgH4WCimoSSD2v3WpLxFbDuGF', '{"registration_id":"0x1fd3175af02104c5970910b5add86337b776b686583659c49c6235053c8d2da7","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-05 06:48:51.85431+00', '4RbPTpBEZ7sqVdQCrRDUgH4WCimoSSD2v3WpLxFbDuGF:0'),
(69, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '5128MaNJ3VENXyTDoJwwUDUqc45D3sSa5SCKh83tAJbU', '{"amount":"200000000","registration_id":"0x1fd3175af02104c5970910b5add86337b776b686583659c49c6235053c8d2da7","head_of_household":"0x31a3c58f194727e5f1cd07c6ebcddc1f469886309dbe4d8370b78ee9d5d0f6ab"}', '2026-09-06 02:35:51.34179+00', '5128MaNJ3VENXyTDoJwwUDUqc45D3sSa5SCKh83tAJbU:0'),
(70, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '3AQiH9syDExNQSSZD1qdmWL8ewFKxW8DbvpmT3BbvTGy', '{"donor":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","amount":"10000000"}', '2026-09-06 02:35:51.465865+00', '3AQiH9syDExNQSSZD1qdmWL8ewFKxW8DbvpmT3BbvTGy:0'),
(71, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, '3fT36cbxeMvdwvKPU5KWc7wpJerwSamMf9nUcJf2YLjE', '{"registration_id":"0x7b4cd4427194558764e967112d2cbb11be76d2479fb08cf27a8be6a812681937","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-06 02:40:10.306695+00', '3fT36cbxeMvdwvKPU5KWc7wpJerwSamMf9nUcJf2YLjE:0'),
(72, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::RegistrationSubmitted', null, '7Y97KLxUdeex6sn1zzrWavGWmj2qfijVutngjYjCUuQw', '{"channel":0,"registrar":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","household_id":"880101-14-5579","registration_id":"0xa452df8a10d2a51e3846aad8c577a5a63f8c1fb1006174edc3310144f8342910"}', '2026-09-06 02:47:41.383942+00', '7Y97KLxUdeex6sn1zzrWavGWmj2qfijVutngjYjCUuQw:0'),
(73, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::HouseholdLinked', null, 'BY4yK1ELadQERLDv8uCKkHFCoa6FRnfVMv9sRmRpuCat', '{"registration_id":"0xa452df8a10d2a51e3846aad8c577a5a63f8c1fb1006174edc3310144f8342910","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-06 02:47:55.666383+00', 'BY4yK1ELadQERLDv8uCKkHFCoa6FRnfVMv9sRmRpuCat:0'),
(74, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, '8SRRXzAmDdZGM3eoURJ3Uw1ohHiq246D7Qc6DegYxSpR', '{"donor":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","amount":"100000000"}', '2026-09-06 02:48:52.548573+00', '8SRRXzAmDdZGM3eoURJ3Uw1ohHiq246D7Qc6DegYxSpR:0'),
(75, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, 'EixLTcpHVpMA3zjsbaQVhnCTwnu8QL6jxtbEVczQEyZb', '{"amount":"50000000","registration_id":"0xa452df8a10d2a51e3846aad8c577a5a63f8c1fb1006174edc3310144f8342910","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-06 02:49:09.686635+00', 'EixLTcpHVpMA3zjsbaQVhnCTwnu8QL6jxtbEVczQEyZb:0'),
(76, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::AidPaid', null, '7onmSeuQLAKtkdFkXAccv92fdomhTzgjWA6zxbnuyZBZ', '{"amount":"50000000","registration_id":"0x7b4cd4427194558764e967112d2cbb11be76d2479fb08cf27a8be6a812681937","head_of_household":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf"}', '2026-09-06 02:49:20.922126+00', '7onmSeuQLAKtkdFkXAccv92fdomhTzgjWA6zxbnuyZBZ:0'),
(77, '0x5827c6fb56bf26e01ecf565ac60429ecdc8029a47f8798f4872a41fb46b35d00::relief_v3::Donated', null, 'HGyaMTc5h7dEyW7Kv2e9S2KeW6cEWxCNQgZTKMxprxuS', '{"donor":"0xd858e245d4e38e29dd993c3605e9a5b46d7dc0d199bd8e5a2df98e1b913a2daf","amount":"100000000"}', '2026-09-06 02:49:34.198764+00', 'HGyaMTc5h7dEyW7Kv2e9S2KeW6cEWxCNQgZTKMxprxuS:0');


-- Indexer State
INSERT INTO "public"."indexer_state"
("id", "cursor", "updated_at")
VALUES
('relief', 'KAFCDgit3qy1ARC85OjiDhgA', '2026-09-06 02:49:34.561+00');


-- Zone Evidence
INSERT INTO "public"."zone_evidence"
("id", "zone_id", "source_type", "url", "extracted_text", "fetch_status", "created_at")
VALUES
(1, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'url', 'https://en.wikipedia.org/wiki/2014%E2%80%9315_Malaysia_floods', '2014–2015 Malaysian floods - Wikipedia 

 

 

 

 

 

 

 

 

 

 

 

 

 

 
 Jump to content 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 From Wikipedia, the free encyclopedia

 

 (Redirected from 2014–15 Malaysia floods ) 

 

 {{cite web|url=https://www.asiaone.com/malaysia/floods-kill-21-malaysia-waters-recede|title=Floods kill 21 in Malaysia, waters recede|work=[[Agence France-Presse]]|publisher=[[AsiaOne]]|date=31 December 2014|access-date=31 December 2014}}</ref>"},"damages":{"wt":"$560 million (USD 2016)<ref>{{cite web|url=http://www.postonline.co.uk/post/news/2389886/malaysia-flood-damage-to-cost-usd560m|title=Malaysia flood damage to cost $560m |publisher=[[Post Magazine]]|date=13 January 2015|access-date=13 January 2015}} {{subscription required}}</ref>"},"affected":{"wt":"[[Johor]], [[Kedah]], [[Kelantan]], [[Negeri Sembilan]], [[Pahang]], [[Perak]], [[Perlis]], [[Sabah]], [[Sarawak]], [[Selangor]] and [[Terengganu]] (Mostly in the East Coast and northern region of Peninsular Malaysia)"}},"i":1}},{"template":{"target":{"wt":"Infobox weather event/Footer\n","href":"./Template:Infobox_weather_event/Footer"},"params":{},"i":2}}]}''> 

 

 

 The 2014–2015 Malaysian floods affected Malaysia from 15 December 2014 – 3 January 2015. More than 500,000 people were affected in Malaysia. Kelantan was the highest affected with 354,800 while 21 were killed. [ 1 ] These floods have been described as the worst in decades. [ 3 ] 

 
 Affected areas
 [ edit ] 

 As part of the northeast monsoon , [ 4 ] heavy rains since 17 December forced 3,390 people in Kelantan and 4,209 people in Terengganu to flee their homes. [ 5 ] Several Keretapi Tanah Melayu (KTM) intercity train services along the East Coast route were disrupted on 18 December following the floods. [ 6 ] On 20 December, the area of Kajang , Selangor, was also hit by serious floods. [ 7 ] By 23 December, most rivers in Kelantan, Pahang, Perak and Terengganu had reached dangerous levels. [ 8 ] Due to rising water levels, most businesses were affected and about 60,000 people were evacuated the following day. The state of Kelantan had the most evacuees (20,468 [ 9 ] to 24,765), followed by Terengganu (21,606), Pahang (10,825), Perak (1,030), Sabah (336) and Perlis (143). [ 10 ] [ 11 ] 

 The situation continues to worsen in Kelantan and Terengganu, due to heavy rain. Most roads in Kelantan have been closed. [ 12 ] The worst-hit district in Terengganu is Kemaman , followed by Dungun , Kuala Terengganu , Hulu Terengganu , Besut and Marang . In Pahang, the worst-hit areas are Kuantan , Maran , Jerantut , Lipis and Pekan . [ 12 ] Dozens of foreign tourists were stranded at a resort in a Malaysian national park in Pahang . Most were travellers from Canada, Britain, Australia and Romania. [ 13 ] All were rescued via boat and helicopter. [ 3 ] In Kedah, at least 51 people were evacuated. [ 14 ] A teenager in Perlis was the first victim to die in this flood. [ 15 ] 

 In southern Malaysia, between 300 and 350 people have been displaced in both Johor and Negeri Sembilan. [ 16 ] [ 17 ] The number of evacuees nationwide reached more than 200,000 by 28 December, with 10 people killed. The flooding is considered the country''s worst in decades. [ 3 ] [ 18 ] [ 19 ] However, the exact numbers of evacuees, missing persons and deaths are unknown, as the Malaysian flood centre was unable to provide any accurate figures. [ 20 ] Some victim were found in miserable condition as the victim had to survive on one meal of rice a day after he was stranded in the floods. [ 21 ] On 31 December, a Royal Malaysia Police Ecureuill AS 355F2 helicopter crashed during a patrol in Kelantan, injuring four crews on board. [ 22 ] 

 In Sabah, heavy rains since 21 December resulted in flooding throughout most areas in the district of Beaufort . As many as 30 villages were severely affected due to the water level of Padas River rising up to 9.26 metres above the danger level, with the floods caused mainly by the overflow of water from the river''s upper reaches in the Tenom district. [ 23 ] About 292 people were evacuated as the flood situation worsened in Beaufort, while the condition improved in the interior districts of Tenom and Kemabong. [ 24 ] The number of victims increased to 300 overnight. [ 25 ] Most victims in Tenom were able to return home, with only one of the eleven flood relief centres still operational as water levels receded. [ 26 ] However, more relief centres are expected to be opened if the rain continues and the water from upper Tenom and Keningau flood the Padas River. [ 27 ] In Kudat , 9 families comprising 63 people were affected by floods and have sought shelter at relatives'' and neighbours'' houses. [ 26 ] [ 27 ] In Sarawak, several villages in upper Baram hit by floods on 29 December. [ 28 ] 

 As of 2 January 2015, floodwaters continued to recede and the number of evacuees in Kelantan, Terengganu, Pahang and Perak continued to reduce while the state of Sabah once again prepared for rising numbers of evacuees as floodwaters has started to rise in Kota Belud . [ 29 ] Over 1,000 people been evacuated in northern Sabah during the floods. [ 30 ] On 3 January, the area of south-western Sipitang district was flooded while floods in the northern Sabah including Kota Belud, Kota Marudu and Pitas had receded. [ 31 ] In Tawau , three primary schools were also affected by floods but the waters began to recede at the afternoon. [ 32 ] 

 Effects
 [ edit ] 

 Healthcare
 [ edit ] 

 As of 29 December, the flooding has affected 102 health facilities in West Malaysia, 38 of which are still operating. [ 33 ] An anaesthesiologist working in Kelantan ''s Kuala Krai Hospital had to intubate a baby in the dark after a diesel generator ran out of fuel. [ 34 ] Helicopters were used to evacuate patients from Kuala Krai Hospital as the flood worsened. [ 35 ] The 180 hospital staffs have been working tirelessly for over 5 days. [ 36 ] The ho', 'ok', '2026-09-04 22:11:50.449375+00'), (2, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'text', null, 'NADMA situation report dated 2 September 2026: continuous monsoon rain caused flash floods in Kampung Test Flood 2026, affecting postcodes 43000 and 43100. Over 800 residents evacuated to PPS centres. District office confirmed the area as an active disaster zone.', 'manual', '2026-09-04 22:11:50.622331+00'), (3, '0x5bbdf8cf6b1d192733c85fe8230680a39129b962cb7d6f2b1f24872f9214b07b', 'text', null, 'Bernama, 4 September 2026 - The Ipoh district office confirmed continuous flooding in Credibility Demo Zone affecting postcodes 31000 and 31900 after three days of non-stop rain overflowed the Kinta River. NADMA has activated two PPS evacuation centres, housing 640 residents as of this morning. The state disaster management committee declared the affected area a flood disaster zone effective 2 September 2026.', 'manual', '2026-09-04 22:15:19.671656+00'), (4, '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'url', 'https://www.dosm.gov.my/portal-main/release-content/special-report-on-impact-of-floods-in-malaysia2025', 'Department of Statistics Malaysia 

 

 
 
 
 
 
 

 
 
 

 
 
 

 
 
 
 
 
 
 
 
 

 
 

 

 

 
 
 
 

 
 
 

 
 

 
 

 
 
 

 



 
 

 
 
 
 
 
 
 Main Menu 
 
 
 Home 
 
 About Us › 

 
 Statistics › 

 
 Methods & Standards › 

 
 Services & Tools › 

 
 Gallery › 

 DOSM''s Community 

 
 
 About Us
 
 
 


 
 
 
 ← back 
 

 DOSM Profile 
 Chief Statistician''s Message 
 Background, Role & Function 
 Objectives, Vision, Mission & Motto 
 Organisation Chart 
 Core Values 
 Songs 
 Logo 
 Leaders 
 Speech 
 Chief Digital Officer (CDO) 
 Policy & Client''s Charter 
 Strategic Plan 
 Annual Report 
 Act & Regulation 
 The Strengthening of The National Statistical System (SNSS) 
 Awards & Recognition 
 Contact Us 
 Directory 
 Procument 
 Advertisement 
 Result 

 
 
 Statistics
 
 
 


 
 
 
 ← back 
 

 Advance Release Calendar 
 Publications 
 Open Data 
 Economy 
 Agriculture 
 Construction 
 Economics Indicator 
 External Sector 
 Manufacturing 
 Mining & Quarrying 
 National Accounts 
 Others 
 Prices 
 Services 
 Social 
 Environment 
 Household Income & Expenditure 
 Social Indicators 
 Population & Demography 
 Labour Market 
 Small Area Statistics 
 Ad hoc 
 Agriculture Census 
 System of Environmental-Economic Accounting (SEEA) 
 Sustainable Development Goals (SDG) 
 COVID-19 Malaysia 
 Pocket Stats 
 National Summary Data Page (NSDP) 
 Explore Release By Alphabet 
 Glossary A-Z 

 
 
 Methods & Standards
 
 
 


 
 
 
 ← back 
 

 Metadata 
 Metadata Guideline 
 Metadata - Publication Level 
 Codes & Classification 
 Regional Classifications 
 Social / Demographic Classifications 
 Economic Classifications 
 Reference 

 
 
 Services & Tools
 
 
 


 
 
 
 ← back 
 

 Census & Surveys 
 Online Services 
 Data Request 
 Respondents 

 
 
 Gallery
 
 
 


 
 
 
 ← back 
 

 Media 
 Press Statement 
 General News 
 Media Coverage for Statistical Releases 
 Video Gallery 
 Newsletter & Bulletin 
 Newsletter 
 Bulletin 
 Programme 
 MyStats Day 
 MyStats Conference 
 International Programme 
 ASEAN-Malaysia Chairmanship 2025 
 Gallery Photo 
 Research Papers 
 Journals 
 Research Posters 
 Technical Paper 
 Report 

 
 
 
 &copy;Copyright 
 
 Department Of Statistics Malaysia (DOSM) All Rights Reserved 








 


 
 




 

 
 
 
 
 
 Flood Impact



 
 Home 

 Statistics 

 Ad hoc 

 Flood Impact 

 







 
 
 
 
 
 
 

 
 

 
 
 Special Report on Impact of Floods in Malaysia 

 Latest Release : 15 April 2026



 
 
 
 
 
 
 Previous Release
 
 
 19 March 2025 

Special Report on Impact of Floods in Malaysia
 
 11 March 2024 

Special Report on Impact of Floods in Malaysia, 2023
 
 23 February 2023 

Special Report on Impact of Floods in Malaysia
 
 28 January 2022 

Special Report on Impact of Floods in Malaysia 2021
 
 Show all release archives 
 






 
 
 
 Share this release


 
 
 
 

 


 
 
 
 
 
 
 Download release
 
 








 
 Overview
 This report presents statistics on the value of flood losses in Malaysia for year 2025. The statistics were obtained from a special survey conducted from January to December 2025. The flood losses include the value of damage for living quarters, vehicles, businesses, and industrial premises. Total damage for agricultural industry and public assets & infrastructure were assessed based on information released by the relevant government agencies 
 In 2025, the total losses caused by flood amounted to RM636.9 million (2024: RM933.4 million), equivalent to 0.03 percent (2024: 0.05%) as against the nominal Gross Domestic Product (GDP). These losses include living quarters amounting to RM183.8 million (2024: RM372.2 million), vehicle losses RM6.8 million (2024: RM17.3 million), business premises valued at RM13.4 million (2024: RM54.1 million), manufacturing sector with RM0.1 million (2024: RM1.2 million), agricultural sector RM52.6 million (2024: RM185.2 million), and public assets & infrastructure totaling RM380.2 million (2024: RM303.4 million) 

 
 In 2025, all states in Malaysia were affected by floods, with Terengganu recording the highest loss value at RM89.2 million (2024: RM182.0 million). This was followed by Kelantan and Johor, which recorded losses of RM88.5 million (2024: RM263.0 million) and RM72.1 million (2024: RM59.0 million). In addition, Sarawak, Sabah, and Selangor were also among the states recorded the substantial loss values, at RM61.2 million (2024: RM27.4 million), RM58.4 million (2024: RM36.8 million), and RM52.9 million (2024: RM22.6 million), respectively. 

 Sarawak recorded the highest living quarters damage losses, amounting to RM32.6 million (2024: RM2.2 million). This was followed by Sabah with RM27.7 million of losses (2024: RM17.3 million) and Johor at RM26.2 million (2024: RM21.3 million). Pahang recorded the fourth highest for living quarters damage loss in 2025, amounting to RM18.8 million (2024: RM11.0 million), followed by Kelantan and Perak at RM15.6 million (2024: RM139.0 million) and RM15.3 million (2024: RM12.2 million), respectively. 

 
 For vehicle damage, Sabah recorded the highest loss value at RM1.3 million in 2025 (2024: RM0.7 million), followed by Johor at RM0.9 million (2024: RM2.1 million). Sarawak, Pahang and Perak were among the states with relatively high losses, recording RM0.8 million (2024: RM0.2 million), RM0.7 million (2024: RM0.9 million) and RM0.6 million (2024: RM0.7 million), respectively. In 2025, Terengganu recorded lower vehicle losses of RM0.4 million compared to 2024, (RM5.8 million). This was followed by Kelantan at RM0.5 million (2024: RM4.0 million) and Kedah at RM0.4 million (2024: RM2.1 million). 

 
 In 2025, 14 states experienced losses due to business premises damage following the floods that affected the country. Sarawak r', 'ok', '2026-09-05 06:36:59.779154+00'), (5, '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'url', 'https://reliefweb.int/disaster/fl-2025-000211-mys', 'Malaysia: Floods - Nov 2025 | ReliefWeb 

 

 

 
 Skip to main content 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 
 Disaster description

 The National Disaster Management Agency (NADMA) reported flooding across eight northern states (Kelantan, Perlis, Perak, Selangor, Kedah, Pulau Pinang, Terengganu and Pahang), which displaced 24,907 people (8,308 families) who sheltered in 125 evacuation centres. ( OCHA, 27 Nov 2025 )

 [...], two people died, and 18,700 people had been displaced, according to the ASEAN Coordinating Centre for Humanitarian Assistance on disaster management (AHA Centre). ( ECHO, 2 Dec 2025 ) By 4 December, 37,000 people were displaced across eight states: Kelantan, Perlis, Perak, Selangor, Kedah, Penang, Terengganu, and Pahang. ( ECHO, 4 Dec 2025 )

 As of 6 December, the International Federation of Red Cross and Red Crescent Societies (IFRC) reported two confirmed fatalities and 1,970 individuals sheltered in 33 temporary evacuation centers across seven states: Perak, Sabah, Selangor, Kelantan, Pahang, Sarawak, and Perlis. The majority of evacuees are in Perak (1,321 people), followed by Selangor (296) and Sabah (186). ( ECHO, 9 Dec 2025 )

 According to the ASEAN Disaster Information Network (ADINet), three people died and 781 people had been displaced to 11 evacuation centres across the peninsula. ( ECHO, 12 Dec 2025 ) ADINet reported, on 16 December, almost 1,500 evacuated people across seven evacuation centres across the Terengganu state, where the most affected is the Kemaman district, eastern Terengganu state. ( ECHO, 16 Dec 2025 )

 According to national authorities, four people died (this number includes fatalities reported since mid-November), and 14,982 individuals had been displaced in 108 evacuation centres as most of Malaysia continued to experience heavy rain, floods and landslides. The worst-hit state is Pahang in Peninsular Malaysia, where almost 13,000 people had been displaced. ( ECHO, 19 Dec 2025 )

 From late December 2025, eastern Malaysia (comprising the states of Sabah and Sarawak) was affected by floods that resulted in displacement and damage. As of 12 January, ADINet reported 3,516 displaced people in 27 evacuation centres across Sabah and Sarawak. In addition, the IFRC also reported 42 closed schools across the affected area. ( ECHO, 12 Jan 2026 )

 Heavy rainfall has been affecting eastern Malaysia (the Malaysian part of Borneo Island) since 21 February, causing floods, flash floods and overflowing rivers that have resulted in population displacement and damage. The International Federation of Red Cross and Red Crescent Societies (IFRC) reports, as of 23 February, more than 3,000 evacuated people, a part of whom are in a number of temporary evacuation centres across the Sabah and Sarawak states. The most affected districts are Pitas and Kota Marudu (Sabah state) and Kuching, Siburan and Padawan (Sarawak state). ( ECHO, 23 Feb 2026 )

 The International Federation of Red Cross and Red Crescent Societies (IFRC) and media report, as of 27 February, nearly 4 000 people have been evacuated to 17 temporary evacuation centres across the Sabah state. The most affected districts are Tenom (the worst affected, with approximately 1 850 evacuated people in eight temporary evacuation centres), Beaufort, Membakut, Sook, Sipitang and Pitas. In addition, the media also reports a total of more than 5 000 affected people across 146 villages throughout the aforementioned affected districts. ( ECHO, 27 Feb 2026 )

 Heavy rainfall continues to affect eastern Malaysia (the Malaysian part of Borneo Island), causing floods and triggering landslides that have resulted in more population displacement and damage.&rsquo; The ASEAN Disaster Information Network (ADINet) reports, as of 13 March, a total of 320 still evacuated people throughout the Sabah state, of whom 300 are in five evacuation centres across the Paitan district due to floods and 20 evacuated people are in one evacuation centre in the Sandakan district due to landslides. ADINet also reports a total of nearly 1 650 affected people since the beginning of the events across the Sabah and the Sarawak states. ( ECHO, 13 Mar 2026 )

 

 
 Affected Countries

 

 

 

 

 

 
 Latest Updates

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 Maps and Infographics

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 
 Most Read

 

 

 

 

 

 

 

 

 

 

 

 

 No continent was spared from crippling climate disasters in 2025, with at least one disaster in each of the six populated regions of the world making the Christian Aid report.

 

 

 

 

 

 

 

 

 

 Climate-related disasters striking the same communities over and over again is leaving families with less time to recover between each blow, and children disconnected from the services they need.', 'ok', '2026-09-05 06:37:09.574548+00');



-- Zone Credibility Results
INSERT INTO "public"."zone_credibility_results"
("id", "zone_id", "run_id", "model", "label", "score", "summary", "gonka_request_id", "error", "created_at")
VALUES
(1, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '304ab37e-90cc-40ce-bb37-30702b5044bb', 'deepseek-ai/DeepSeek-V4-Flash-0731', 'inconsistent', '15.00', 'Evidence describes 2014–2015 Malaysian floods, not 2026. Source 1 mentions Kajang, Selangor but no postcodes 43000/43100/43200 or ''Kampung Test Flood 2026''. Source 2 is a fabricated NADMA report with no verifiable text. Timeframe and event contradict zone claims.', 'req-1788559952532854703-976874', null, '2026-09-04 22:12:39.239996+00'),
(2, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '304ab37e-90cc-40ce-bb37-30702b5044bb', 'MiniMaxAI/MiniMax-M2.7', null, null, null, null, 'No JSON found in model output', '2026-09-04 22:12:39.239996+00'),
(3, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', '304ab37e-90cc-40ce-bb37-30702b5044bb', 'moonshotai/Kimi-K2.6', null, null, null, null, 'GonkaRouter 400 (moonshotai/Kimi-K2.6): {"error":{"message":"unsupported model \"moonshotai/Kimi-K2.6\"; supported models: MiniMaxAI/MiniMax-M2.7, deepseek-ai/DeepSeek-V4-Flash-0731","type":"upstream_error","param":"","code":null}}', '2026-09-04 22:12:39.239996+00'),
(4, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'de0ffb22-5b3f-4025-b28f-f2083d02c9dd', 'deepseek-ai/DeepSeek-V4-Flash-0731', 'inconsistent', '10.00', 'Evidence describes 2014–2015 Malaysia floods, not a 2026 event. Source 1 timeframe (15 Dec 2014–3 Jan 2015) contradicts zone''s 2026 claim. Source 2 mentions 2026 and postcodes 43000/43100 but is unverifiable pasted text; no corroborating detail for 43200. Overall mismatch in timeframe.', 'req-1788560036282010250-977225', null, '2026-09-04 22:14:07.109987+00'),
(5, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'de0ffb22-5b3f-4025-b28f-f2083d02c9dd', 'MiniMaxAI/MiniMax-M2.7', 'partially-supported', '65.00', 'Source 2 (NADMA report) directly names ''Kampung Test Flood 2026'', specifies postcodes 43000 and 43100, and confirms active disaster zone status with 800+ evacuations. However, postcode 43200 is not mentioned. Source 1 (2014-2015 floods) is irrelevant — wrong timeframe and location. The NADMA report alone provides sufficient disaster evidence but incomplete postcode coverage.', 'req-1788560036286144099-977229', null, '2026-09-04 22:14:07.109987+00'),
(6, '0x79f858ef2145192d79004f81ff18f01db03b8b30b598bb1fc1f3ca5ab6bb960f', 'de0ffb22-5b3f-4025-b28f-f2083d02c9dd', 'moonshotai/Kimi-K2.6', null, null, null, null, 'GonkaRouter 400 (moonshotai/Kimi-K2.6): {"error":{"message":"unsupported model \"moonshotai/Kimi-K2.6\"; supported models: MiniMaxAI/MiniMax-M2.7, deepseek-ai/DeepSeek-V4-Flash-0731","type":"upstream_error","param":"","code":null}}', '2026-09-04 22:14:07.109987+00'),
(7, '0x5bbdf8cf6b1d192733c85fe8230680a39129b962cb7d6f2b1f24872f9214b07b', 'e192f652-e9cf-46a3-973b-705da8e22417', 'deepseek-ai/DeepSeek-V4-Flash-0731', 'well-supported', '95.00', 'Evidence names Credibility Demo Zone, postcodes 31000 and 31900, and flood disaster from 2 September 2026, matching active timeframe. Bernama report confirms continuous flooding, PPS centres, and 640 residents, directly supporting all claims.', 'req-1788560120354914217-977690', null, '2026-09-04 22:15:29.114339+00'),
(8, '0x5bbdf8cf6b1d192733c85fe8230680a39129b962cb7d6f2b1f24872f9214b07b', 'e192f652-e9cf-46a3-973b-705da8e22417', 'MiniMaxAI/MiniMax-M2.7', 'well-supported', '95.00', 'Evidence specifically names ''Credibility Demo Zone'' and lists exact postcodes 31000 and 31900. Bernama reports NADMA-activated evacuation centres with 640 residents, and state disaster committee declared flood disaster zone effective 2 September 2026. Source includes official government sources (NADMA, Ipoh district office) and specific dates, strongly matching the zone''s claims.', 'req-1788560120307168292-977687', null, '2026-09-04 22:15:29.114339+00'),
(9, '0x5bbdf8cf6b1d192733c85fe8230680a39129b962cb7d6f2b1f24872f9214b07b', 'e192f652-e9cf-46a3-973b-705da8e22417', 'moonshotai/Kimi-K2.6', null, null, null, null, 'GonkaRouter 400 (moonshotai/Kimi-K2.6): {"error":{"message":"unsupported model \"moonshotai/Kimi-K2.6\"; supported models: MiniMaxAI/MiniMax-M2.7, deepseek-ai/DeepSeek-V4-Flash-0731","type":"upstream_error","param":"","code":null}}', '2026-09-04 22:15:29.114339+00'),
(10, '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'e5c2ec8d-267b-4dc2-865d-c248fa836b8b', 'deepseek-ai/DeepSeek-V4-Flash-0731', 'partially-supported', '62.00', 'DOSM report confirms Terengganu had highest flood losses in 2025 (RM89.2M), matching zone''s state and year. ReliefWeb confirms Nov 2025 floods affecting Terengganu, with 16 Dec report noting ~1,500 evacuees in Terengganu, Kemaman district. However, evidence lacks specific postcode-level detail (20000, 21500, 21800) and exact dates for those areas, so location specificity is partial.', 'req-1788590232554577838-1077495', null, '2026-09-05 06:37:37.212513+00'),
(11, '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'e5c2ec8d-267b-4dc2-865d-c248fa836b8b', 'MiniMaxAI/MiniMax-M2.7', null, null, null, null, 'No JSON found in model output', '2026-09-05 06:37:37.212513+00'), (12, '0x24d58ab970e40ff116492309de09ab2fa80dc2a708a209d049e8d077dab6dabb', 'e5c2ec8d-267b-4dc2-865d-c248fa836b8b', 'moonshotai/Kimi-K2.6', null, null, null, null, 'Timed out', '2026-09-05 06:37:37.212513+00');
