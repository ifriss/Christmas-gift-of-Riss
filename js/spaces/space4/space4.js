/* Space 4 — Bản đồ sơn mài 34 tỉnh/thành sau sáp nhập + Hoàng Sa, Trường Sa: SVG từ GeoJSON, zoom/pan, Canvas bụi nhũ vàng. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const LANG_KEY = 'cgor_lang';
  const SRC = ['./assets/vn-all.geo.json', 'https://code.highcharts.com/mapdata/countries/vn/vn-all.geo.json'];
  const GEO = { lon0: 101.9, lon1: 116.3, lat0: 7.2, lat1: 23.6 }; // đất liền + Hoàng Sa + Trường Sa
  const KX = Math.cos(15 * Math.PI / 180), S = 100, PAD = 40;
  const FREQ = [293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const ALIAS = { thuathienhue: 'hue', hochiminh: 'hcm', hochiminhcity: 'hcm', dacnong: 'daknong', daclac: 'daklak', vungtau: 'bariavungtau', southeast: 'dongnai', quangnam: 'danang' };
  // Tâm gần đúng (kinh, vĩ) của vài tỉnh cũ — dùng để hiệu chuẩn nếu GeoJSON đã được chiếu
  const ANC = { hanoi: [105.7, 21], laocai: [104, 22.3], camau: [105.1, 9.2], daklak: [108.2, 12.8], quangbinh: [106.4, 17.6], nghean: [104.9, 19.2],
    lamdong: [108.1, 11.8], caobang: [106.2, 22.7], sonla: [104.1, 21.2], kiengiang: [105.1, 10], quangnam: [107.9, 15.6], thanhhoa: [105.3, 20], gialai: [108.2, 13.8], tayninh: [106.1, 11.4] };

  const R = [
    { vi: 'Trung du & miền núi phía Bắc', en: 'Northern Midlands & Mountains', zh: '北部山区' },
    { vi: 'Đồng bằng sông Hồng', en: 'Red River Delta', zh: '红河三角洲' },
    { vi: 'Bắc Trung Bộ', en: 'North Central Coast', zh: '北中部' },
    { vi: 'Nam Trung Bộ', en: 'South Central Coast', zh: '南中部沿海' },
    { vi: 'Tây Nguyên', en: 'Central Highlands', zh: '西原' },
    { vi: 'Đông Nam Bộ', en: 'Southeast', zh: '东南部' },
    { vi: 'Đồng bằng sông Cửu Long', en: 'Mekong Delta', zh: '九龙江平原' }
  ];
  const SEA = { vi: 'Biển Đông · Lãnh thổ biển đảo', en: 'East Sea · Sea & island territory', zh: '东海 · 海岛领土' };
  // [id, vi, en, zh, thành phố?, sáp nhập từ, vùng, mô tả vi, en, zh]
  const ROWS = [
    ['hanoi', 'Hà Nội', 'Hanoi', '河内', 1, '', 1, 'Thủ đô nghìn năm văn hiến, phố cổ và hồ Hoàn Kiếm.', 'Thousand-year capital: Old Quarter and Hoan Kiem Lake.', '千年古都，老城区与还剑湖。'],
    ['hue', 'Huế', 'Hue', '顺化', 1, '', 2, 'Cố đô Đại Nội, sông Hương, nhã nhạc cung đình.', 'Imperial city, Perfume River and royal court music.', '古都皇城、香江与宫廷雅乐。'],
    ['laichau', 'Lai Châu', 'Lai Chau', '莱州', 0, '', 0, 'Đèo Ô Quy Hồ, chợ phiên vùng cao, văn hóa Thái – Mông.', 'O Quy Ho Pass, highland markets, Thai and Hmong culture.', '奥奇湖山口、高原集市与民族文化。'],
    ['dienbien', 'Điện Biên', 'Dien Bien', '奠边', 0, '', 0, 'Chiến trường Điện Biên Phủ, cánh đồng Mường Thanh.', 'Dien Bien Phu battlefield and the Muong Thanh valley.', '奠边府战场与孟清谷地。'],
    ['sonla', 'Sơn La', 'Son La', '山罗', 0, '', 0, 'Cao nguyên Mộc Châu, đồi chè, mùa hoa mận.', 'Moc Chau plateau, tea hills and plum blossoms.', '木州高原、茶山与李花。'],
    ['langson', 'Lạng Sơn', 'Lang Son', '谅山', 0, '', 0, 'Núi Mẫu Sơn, động Tam Thanh, chợ Kỳ Lừa.', 'Mau Son Mountain, Tam Thanh Cave, Ky Lua Market.', '母山、三清洞与祁娄市场。'],
    ['quangninh', 'Quảng Ninh', 'Quang Ninh', '广宁', 0, '', 1, 'Vịnh Hạ Long, Yên Tử, đảo Cô Tô.', 'Ha Long Bay, Yen Tu and Co To Island.', '下龙湾、安子山与姑苏岛。'],
    ['thanhhoa', 'Thanh Hóa', 'Thanh Hoa', '清化', 0, '', 2, 'Thành Nhà Hồ, biển Sầm Sơn, rừng Pù Luông.', 'Ho Citadel, Sam Son beach and Pu Luong forest.', '胡朝古城、岑山海滩与普龙森林。'],
    ['nghean', 'Nghệ An', 'Nghe An', '乂安', 0, '', 2, 'Quê Bác Hồ ở Kim Liên, biển Cửa Lò, dân ca ví giặm.', 'Kim Lien hometown of Ho Chi Minh, Cua Lo beach, Vi Giam folk song.', '金莲故里、洲罗海滩与对歌。'],
    ['hatinh', 'Hà Tĩnh', 'Ha Tinh', '河静', 0, '', 2, 'Ngã ba Đồng Lộc, núi Hồng Lĩnh, ca trù Cổ Đạm.', 'Dong Loc junction, Hong Linh mountains, Co Dam ca tru.', '同禄三岔路、鸿岭山与歌筹。'],
    ['caobang', 'Cao Bằng', 'Cao Bang', '高平', 0, '', 0, 'Thác Bản Giốc, hang Pác Bó, Công viên địa chất Non nước.', 'Ban Gioc Falls, Pac Bo Cave and Non Nuoc Geopark.', '板约瀑布、盘波洞与地质公园。'],
    ['tuyenquang', 'Tuyên Quang', 'Tuyen Quang', '宣光', 0, 'Tuyên Quang + Hà Giang', 0, 'Cao nguyên đá Đồng Văn, cột cờ Lũng Cú, hồ Na Hang.', 'Dong Van Karst Plateau, Lung Cu flag tower, Na Hang Lake.', '同文石高原、龙居旗台与那杭湖。'],
    ['laocai', 'Lào Cai', 'Lao Cai', '老街', 0, 'Lào Cai + Yên Bái', 0, 'Sa Pa, Fansipan, ruộng bậc thang Mù Cang Chải.', 'Sa Pa, Fansipan and Mu Cang Chai terraced fields.', '沙坝、番西邦峰与木江界梯田。'],
    ['thainguyen', 'Thái Nguyên', 'Thai Nguyen', '太原', 0, 'Thái Nguyên + Bắc Kạn', 0, 'Chè Tân Cương, hồ Núi Cốc, hồ Ba Bể.', 'Tan Cuong tea, Nui Coc Lake and Ba Be Lake.', '新疆茶、谷山湖与巴贝湖。'],
    ['phutho', 'Phú Thọ', 'Phu Tho', '富寿', 0, 'Phú Thọ + Vĩnh Phúc + Hòa Bình', 0, 'Đền Hùng, Tam Đảo, thung lũng Mai Châu.', 'Hung Kings Temple, Tam Dao and the Mai Chau valley.', '雄王庙、三岛山与枚州谷地。'],
    ['bacninh', 'Bắc Ninh', 'Bac Ninh', '北宁', 0, 'Bắc Ninh + Bắc Giang', 1, 'Dân ca quan họ, tranh Đông Hồ, vải thiều Lục Ngạn.', 'Quan Ho folk songs, Dong Ho paintings, Luc Ngan lychee.', '官贺民歌、东湖版画与六岸荔枝。'],
    ['hungyen', 'Hưng Yên', 'Hung Yen', '兴安', 0, 'Hưng Yên + Thái Bình', 1, 'Nhãn lồng, phố Hiến, chùa Keo.', 'Hung Yen longan, Pho Hien and Keo Pagoda.', '兴安龙眼、宪街与笺寺。'],
    ['haiphong', 'Hải Phòng', 'Hai Phong', '海防', 1, 'Hải Phòng + Hải Dương', 1, 'Đảo Cát Bà, hoa phượng đỏ, bánh đa cua.', 'Cat Ba Island, red flamboyant flowers, crab noodle soup.', '吉婆岛、凤凰花与蟹汤面。'],
    ['ninhbinh', 'Ninh Bình', 'Ninh Binh', '宁平', 0, 'Ninh Bình + Hà Nam + Nam Định', 1, 'Tràng An, Tam Cốc, cố đô Hoa Lư.', 'Trang An, Tam Coc and the ancient capital Hoa Lu.', '长安、三谷与华闾古都。'],
    ['quangtri', 'Quảng Trị', 'Quang Tri', '广治', 0, 'Quảng Trị + Quảng Bình', 2, 'Phong Nha – Kẻ Bàng, Thành cổ Quảng Trị.', 'Phong Nha-Ke Bang caves and Quang Tri Citadel.', '峰牙-己榜洞穴与广治古城。'],
    ['danang', 'Đà Nẵng', 'Da Nang', '岘港', 1, 'Đà Nẵng + Quảng Nam', 3, 'Cầu Rồng, Bà Nà Hills, phố cổ Hội An.', 'Dragon Bridge, Ba Na Hills and Hoi An Ancient Town.', '龙桥、巴拿山与会安古镇。'],
    ['quangngai', 'Quảng Ngãi', 'Quang Ngai', '广义', 0, 'Quảng Ngãi + Kon Tum', 3, 'Đảo Lý Sơn, tỏi Lý Sơn, cao nguyên Măng Đen.', 'Ly Son Island, Ly Son garlic, Mang Den highlands.', '李山岛、李山蒜与芒登高原。'],
    ['gialai', 'Gia Lai', 'Gia Lai', '嘉莱', 0, 'Gia Lai + Bình Định', 4, 'Biển Hồ, cồng chiêng, biển Quy Nhơn – Kỳ Co.', 'Bien Ho lake, gong culture, Quy Nhon and Ky Co beaches.', '海湖、锣文化与归仁、奇科海滩。'],
    ['khanhhoa', 'Khánh Hòa', 'Khanh Hoa', '庆和', 0, 'Khánh Hòa + Ninh Thuận', 3, 'Biển Nha Trang, Tháp Bà Ponagar, vịnh Vân Phong.', 'Nha Trang bay, Ponagar Towers, Van Phong Bay.', '芽庄海湾、婆那加占塔与云峰湾。'],
    ['lamdong', 'Lâm Đồng', 'Lam Dong', '林同', 0, 'Lâm Đồng + Đắk Nông + Bình Thuận', 4, 'Đà Lạt ngàn hoa, đồi cát Mũi Né, núi lửa Krông Nô.', 'Flower city Da Lat, Mui Ne dunes, Krong No volcanic caves.', '花城大叻、美奈沙丘与火山洞。'],
    ['daklak', 'Đắk Lắk', 'Dak Lak', '得乐', 0, 'Đắk Lắk + Phú Yên', 4, 'Buôn Ma Thuột, cà phê, Gành Đá Đĩa.', 'Buon Ma Thuot coffee and Ganh Da Dia rock formations.', '邦美蜀咖啡与石碟礁。'],
    ['hcm', 'Hồ Chí Minh', 'Ho Chi Minh', '胡志明', 1, 'TP.HCM + Bình Dương + Bà Rịa - Vũng Tàu', 5, 'Chợ Bến Thành, địa đạo Củ Chi, biển Vũng Tàu, Côn Đảo.', 'Ben Thanh Market, Cu Chi tunnels, Vung Tau and Con Dao.', '滨城市场、古芝地道、头顿与昆岛。'],
    ['dongnai', 'Đồng Nai', 'Dong Nai', '同奈', 0, 'Đồng Nai + Bình Phước', 5, 'Vườn quốc gia Cát Tiên, hồ Trị An, núi Bà Rá.', 'Cat Tien National Park, Tri An Lake, Ba Ra Mountain.', '嘉仙国家公园、治安湖与婆罗山。'],
    ['tayninh', 'Tây Ninh', 'Tay Ninh', '西宁', 0, 'Tây Ninh + Long An', 5, 'Núi Bà Đen, Tòa Thánh Cao Đài, Đồng Tháp Mười.', 'Ba Den Mountain, Cao Dai Holy See, Plain of Reeds.', '黑婆山、高台教圣地与芦苇平原。'],
    ['cantho', 'Cần Thơ', 'Can Tho', '芹苴', 1, 'Cần Thơ + Sóc Trăng + Hậu Giang', 6, 'Chợ nổi Cái Răng, bến Ninh Kiều, chùa Dơi.', 'Cai Rang floating market, Ninh Kieu wharf, Bat Pagoda.', '芽朗水上市场、宁乔码头与蝙蝠寺。'],
    ['vinhlong', 'Vĩnh Long', 'Vinh Long', '永隆', 0, 'Vĩnh Long + Bến Tre + Trà Vinh', 6, 'Xứ dừa Bến Tre, cù lao An Bình, chùa Khmer.', 'Ben Tre coconut land, An Binh islet, Khmer pagodas.', '槟知椰乡、安平沙洲与高棉佛寺。'],
    ['dongthap', 'Đồng Tháp', 'Dong Thap', '同塔', 0, 'Đồng Tháp + Tiền Giang', 6, 'Sen hồng Đồng Tháp, Tràm Chim, trái cây Cái Bè.', 'Pink lotus, Tram Chim park, Cai Be orchards.', '同塔粉莲、鹧鸪鸟保护区与盖贝果园。'],
    ['camau', 'Cà Mau', 'Ca Mau', '金瓯', 0, 'Cà Mau + Bạc Liêu', 6, 'Mũi Cà Mau, rừng đước U Minh, quạt gió Bạc Liêu.', 'Ca Mau Cape, U Minh mangroves, Bac Lieu wind farm.', '金瓯角、乌明红树林与薄辽风电。'],
    ['angiang', 'An Giang', 'An Giang', '安江', 0, 'An Giang + Kiên Giang', 6, 'Núi Sam, rừng tràm Trà Sư, đảo Phú Quốc, Hà Tiên.', 'Sam Mountain, Tra Su forest, Phu Quoc and Ha Tien.', '沙姆山、茶树林、富国岛与河仙。']
  ];
  const BY = {}, K2I = {};
  function norm(s) {
    s = String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
    s = s.replace(/^(tp\.?|thanh pho|tinh)\b\s*/, '').replace(/[^a-z]/g, '').replace(/city$/, '');
    return ALIAS[s] || s;
  }
  ROWS.forEach(function (r) {
    const p = BY[r[0]] = { id: r[0], name: { vi: r[1], en: r[2], zh: r[3] }, city: r[4], from: r[5], reg: r[6], desc: { vi: r[7], en: r[8], zh: r[9] } };
    (r[5] ? r[5].split(' + ') : [r[1]]).forEach(function (n) { K2I[norm(n)] = r[0]; });
  });
  const ISL = [
    { id: 'hoang-sa', box: [111.2, 112.8, 15.7, 17.1], cnt: 16, seed: 7, n: 8, name: { vi: 'Quần đảo Hoàng Sa', en: 'Paracel Islands', zh: '西沙群岛' },
      desc: { vi: 'Quần đảo Hoàng Sa — một phần thiêng liêng của lãnh thổ biển đảo Việt Nam.', en: 'The Paracel Islands — a sacred part of Vietnam\'s sea and island territory.', zh: '西沙群岛——越南海洋与岛屿领土的神圣组成部分。' } },
    { id: 'truong-sa', box: [111.5, 115.8, 7.5, 11.5], cnt: 34, seed: 19, n: 9, name: { vi: 'Quần đảo Trường Sa', en: 'Spratly Islands', zh: '南沙群岛' },
      desc: { vi: 'Quần đảo Trường Sa — tiền tiêu trên biển Tổ quốc, nơi ngư dân bám biển bền bỉ.', en: 'The Spratly Islands — Vietnam\'s frontier at sea, home to resilient fishermen.', zh: '南沙群岛——祖国海上前哨，渔民坚守的海域。' } }
  ];
  ISL.forEach(function (o) { BY[o.id] = { id: o.id, isl: 1, name: o.name, desc: o.desc }; });
  // Kinh tế & đặc sản (tiếng Việt): mỗi dòng = id|kinh tế|sticker 1|sticker 2|sticker 3
  const INFO_RAW = `
hanoi|Dịch vụ tài chính, công nghệ, thương mại và du lịch văn hóa|🍜 Phở Hà Nội|🏺 Gốm Bát Tràng|💻 Công nghệ & dịch vụ
hue|Du lịch di sản, dịch vụ đô thị, thủy sản đầm phá Tam Giang|🏯 Du lịch di sản|🐟 Thủy sản đầm phá|🌿 Nghề hương trầm
laichau|Thủy điện, nông lâm nghiệp vùng cao, du lịch sinh thái|🍵 Chè Shan tuyết|⚡ Thủy điện Sông Đà|🏔️ Du lịch sinh thái
dienbien|Trồng lúa Mường Thanh, chăn nuôi, du lịch lịch sử|🌾 Lúa Mường Thanh|🐄 Chăn nuôi bò|🏛️ Du lịch lịch sử
sonla|Cây công nghiệp, bò sữa, du lịch cao nguyên|🥛 Bò sữa Mộc Châu|🍵 Chè Mộc Châu|🌸 Hoa mận Mộc Châu
langson|Nông lâm nghiệp, thương mại cửa khẩu, du lịch sinh thái|🌰 Hồi Chi Lăng|🛒 Thương mại cửa khẩu|🏔️ Núi Mẫu Sơn
quangninh|Than đá, cảng biển, du lịch Hạ Long, thủy sản biển|⛏️ Than đá|🦪 Hàu & ngọc trai|🚢 Du lịch Hạ Long
thanhhoa|Lọc hóa dầu Nghi Sơn, nông nghiệp, thủy sản biển|🏭 Lọc hóa dầu Nghi Sơn|🐟 Đánh bắt biển|🏖️ Biển Sầm Sơn
nghean|Nông nghiệp, công nghiệp, thương mại, du lịch biển|🍊 Cam Xã Đoài|🦑 Hải sản Cửa Lò|🏖️ Biển Cửa Lò
hatinh|Thép và cảng nước sâu Vũng Áng, nông nghiệp, thủy sản|🏭 Thép Vũng Áng|🐟 Hải sản|🌾 Lúa gạo
caobang|Nông lâm nghiệp, khoáng sản, du lịch biên giới|🌰 Hạt dẻ Trùng Khánh|🌿 Dược liệu|💧 Thác Bản Giốc
tuyenquang|Nông nghiệp (cam, chè), thủy điện, du lịch hồ Na Hang|🍊 Cam Sông Con|🍵 Chè|⚡ Thủy điện Tuyên Quang
laocai|Khai khoáng apatit, chè, du lịch Sa Pa|🌄 Ruộng bậc thang Sa Pa|⛏️ Apatit Tằng Loỏng|🍑 Mận Tam Hoa
thainguyen|Luyện kim, khoáng sản, chè, du lịch hồ|🍵 Chè Tân Cương|🏭 Thép Thái Nguyên|🏞️ Hồ Núi Cốc
phutho|Nông nghiệp, công nghiệp chế biến, du lịch tâm linh|🌳 Bưởi Đoan Hùng|🏛️ Đền Hùng|🐓 Gà Mường
bacninh|Điện tử, linh kiện, nông nghiệp, làng nghề|📱 Điện tử & linh kiện|🍒 Vải thiều Lục Ngạn|🎶 Quan họ
hungyen|Điện tử, ô tô, nông nghiệp trái cây|🐉 Nhãn lồng Hưng Yên|🏭 Điện tử & ô tô|🏯 Phố Hiến
haiphong|Cảng biển, đóng tàu, công nghiệp, du lịch biển|⚓ Cảng biển|🦀 Cua Cát Hải|🏝️ Đảo Cát Bà
ninhbinh|Du lịch di sản, nông nghiệp, vật liệu xây dựng|🛶 Tràng An|🍚 Cơm cháy Ninh Bình|🏯 Cố đô Hoa Lư
quangtri|Du lịch di sản, nông nghiệp, thủy sản|🏞️ Phong Nha|🌾 Lúa gạo|🐟 Thủy sản Cửa Việt
danang|Dịch vụ, du lịch biển, cảng biển, công nghệ|🏖️ Biển Mỹ Khê|🌉 Cầu Rồng|💻 Công nghệ & cảng biển
quangngai|Lọc hóa dầu Dung Quất, nông nghiệp, ngư nghiệp đảo|🧄 Tỏi Lý Sơn|🏭 Lọc hóa dầu Dung Quất|🐟 Ngư nghiệp Lý Sơn
gialai|Cà phê, cao su, hồ tiêu, thủy điện, du lịch|☕ Cà phê|🌶️ Hồ tiêu|⚡ Thủy điện
khanhhoa|Du lịch biển, nuôi trồng thủy sản, dịch vụ|🦞 Tôm hùm|🏖️ Biển Nha Trang|🐦 Yến sào
lamdong|Nông nghiệp công nghệ cao, du lịch Đà Lạt, thủy điện|🌸 Hoa Đà Lạt|🥬 Rau Đà Lạt|☕ Cà phê Bảo Lộc
daklak|Cà phê, cao su, hồ tiêu, điện gió, du lịch|☕ Cà phê|🥑 Sầu riêng|⚡ Điện gió
hcm|Dịch vụ, tài chính, công nghiệp, cảng biển, công nghệ|🏙️ Trung tâm dịch vụ|🚢 Cảng Cát Lái|💻 Công nghệ & tài chính
dongnai|Công nghiệp chế biến, khu công nghiệp, nông nghiệp cây ăn trái|🍊 Bưởi Tân Triều|🏭 Khu công nghiệp|🐔 Chăn nuôi gà
tayninh|Nông nghiệp, cao su, mía, du lịch tâm linh, cửa khẩu|🍠 Khoai mì|🍘 Bánh tráng Trảng Bàng|🏯 Tòa Thánh Cao Đài
cantho|Trung tâm lúa gạo ĐBSCL, thương mại, du lịch chợ nổi|🍚 Lúa gạo|🛶 Chợ nổi Cái Răng|🐟 Cá lóc
vinhlong|Trái cây, dừa, thủ công mỹ nghệ, du lịch sinh thái|🥥 Dừa Bến Tre|🍈 Trái cây sông nước|🧺 Đan lát mỹ nghệ
dongthap|Nông nghiệp, thủy sản, hoa sen|🥭 Xoài Cao Lãnh|🐟 Cá tra|🌸 Làng hoa
camau|Thủy sản, lâm nghiệp rừng ngập mặn, điện gió, khí|🦐 Tôm sú|🦀 Cua biển|🌲 Rừng tràm
angiang|Lúa gạo, thủy sản, du lịch biên giới và đảo|🐟 Cá tra|🌾 Lúa gạo|🏝️ Phú Quốc
hoang-sa|Kinh tế biển, ngư trường truyền thống, chủ quyền biển đảo|🐟 Ngư trường lớn|⚓ Chủ quyền VN|🌊 Kinh tế biển
truong-sa|Kinh tế biển, ngư trường truyền thống, tiền tiêu trên biển|🐟 Ngư trường lớn|⚓ Chủ quyền VN|🌊 Kinh tế biển
phu-quoc|Kinh tế du lịch biển đảo quốc tế, cảng biển và chế biến hải sản|🏝️ Đảo ngọc|🐟 Nước mắm|🦪 Ngọc trai
con-dao|Du lịch sinh thái biển, bảo tồn thiên nhiên và di tích lịch sử|🐢 Rùa biển|⚓ Cảng biển|🌿 Vườn quốc gia
`;
  const INFO = {};
  INFO_RAW.split('\n').forEach(function (r) {
    r = r.trim(); if (!r) return;
    const f = r.split('|'); INFO[f[0]] = { e: f[1], s: f.slice(2, 5) };
  });
  // Điểm đảo (Phú Quốc, Côn Đảo) và 12 công trình: lon/lat, nhãn, tỉnh, mô tả, icon SVG (hệ tọa độ quanh 0)
  const DOT = 'M-2.6 0A2.6 2.6 0 1 0 2.6 0A2.6 2.6 0 1 0-2.6 0Z';
  const MARKS = [
    { id: 'phu-quoc', n: 'Đảo Phú Quốc', sub: 'Tỉnh An Giang', lon: 103.96, lat: 10.22, d: DOT, desc: 'Đảo ngọc phía Tây Nam, nổi tiếng về biển đảo và nước mắm truyền thống.' },
    { id: 'con-dao', n: 'Côn Đảo', sub: 'TP. Hồ Chí Minh', lon: 106.60, lat: 8.68, d: DOT, desc: 'Quần đảo giàu rừng biển, nhiều di tích lịch sử và Vườn quốc gia Côn Đảo.' },
    { id: 'lungcu', n: 'Cột cờ Lũng Cú', sub: 'Tỉnh Tuyên Quang', lon: 105.31, lat: 23.36, lm: 1, d: 'M-3 6V-6M-3-6L5-3.5L-3-1', desc: 'Cột cờ Tổ quốc trên cao nguyên đá Đồng Văn, biểu tượng cực Bắc thiêng liêng.' },
    { id: 'thaprua', n: 'Tháp Rùa & Chùa Một Cột', sub: 'Thành phố Hà Nội', lon: 105.85, lat: 21.03, lm: 1, d: 'M-6 6H6M-4 6V-1H4V6M-6-1H6M0-1V-7', desc: 'Hồ Hoàn Kiếm và chùa Một Cột, biểu tượng kiến trúc Thăng Long xưa.' },
    { id: 'hontrongmai', n: 'Hòn Trống Mái', sub: 'Vịnh Hạ Long, Quảng Ninh', lon: 107.08, lat: 20.90, lm: 1, d: 'M-7 5Q-6-6 0-5Q7-6 7 5Z', desc: 'Khối đá vôi kỳ vĩ giữa vịnh Hạ Long, di sản thiên nhiên thế giới.' },
    { id: 'ngomon', n: 'Ngọ Môn Kinh Thành', sub: 'TP. Huế', lon: 107.58, lat: 16.47, lm: 1, d: 'M-6 6V-2H6V6M-6-2L0-6L6-2M-2 6V1H2V6', desc: 'Cổng chính Đại Nội Huế, nơi cử hành các nghi lễ triều đình xưa.' },
    { id: 'cauRong', n: 'Cầu Rồng & Cầu Vàng', sub: 'TP. Đà Nẵng', lon: 108.22, lat: 16.06, lm: 1, d: 'M-7 3Q0-7 7 3M-7 3V6M7 3V6M5-2L7-5L8-1', desc: 'Cầu Rồng phun lửa, nước vào cuối tuần; Cầu Vàng nằm trên Bà Nà Hills.' },
    { id: 'nharong', n: 'Nhà Rông Tây Nguyên', sub: 'Tỉnh Gia Lai', lon: 108.00, lat: 14.00, lm: 1, d: 'M-6 6L0-6L6 6ZM-2 6V1H2V6', desc: 'Nhà Rông, kiến trúc cộng đồng và biểu tượng văn hóa Ba Na, Gia Rai.' },
    { id: 'ponagar', n: 'Tháp Bà Ponagar', sub: 'Tỉnh Khánh Hòa', lon: 109.19, lat: 12.26, lm: 1, d: 'M-5 6V-1H5V6M-3-1V-6H3V-1M-1-6V-8', desc: 'Quần thể tháp Chăm xây từ thế kỷ VII đến XIII bên sông Cái, Nha Trang.' },
    { id: 'landmark81', n: 'Bến Nhà Rồng & Landmark 81', sub: 'TP. Hồ Chí Minh', lon: 106.70, lat: 10.78, lm: 1, d: 'M-4 6V-4H4V6M-4-4H4M0-4V-8', desc: 'Bến Nhà Rồng, dấu tích lịch sử bên sông Sài Gòn; Landmark 81 là tòa nhà cao nhất Việt Nam.' },
    { id: 'cauCanTho', n: 'Cầu Cần Thơ & Chợ Nổi', sub: 'TP. Cần Thơ', lon: 105.78, lat: 10.03, lm: 1, d: 'M-7 4H7M-4 4V-6M4 4V-6M-4-6L0 4L4-6', desc: 'Cầu dây văng bắc qua sông Hậu, gần chợ nổi Cái Răng sôi động.' },
    { id: 'muiCaMau', n: 'Mũi Cà Mau', sub: 'Tỉnh Cà Mau', lon: 104.73, lat: 8.61, lm: 1, d: 'M-6-6Q4-6 5 1L1 6L-1 0Q-6-2-6-6Z', desc: 'Điểm cực Nam của Tổ quốc, nơi đất liền vươn ra biển Đông.' },
    { id: 'mocHoangSa', n: 'Cột mốc Chủ quyền Hoàng Sa', sub: 'Quần đảo Hoàng Sa', lon: 112.00, lat: 16.50, lm: 1, d: 'M-5 6H5M0 6V-7M0-7L6-5L0-3', desc: 'Cột mốc khẳng định chủ quyền Việt Nam trên quần đảo Hoàng Sa.' },
    { id: 'mocTruongSa', n: 'Cột mốc Chủ quyền Trường Sa', sub: 'Quần đảo Trường Sa', lon: 113.50, lat: 9.50, lm: 1, d: 'M-7 6Q-4 3-1 6T5 6M0 3V-7M0-7L6-5L0-3', desc: 'Cột mốc khẳng định chủ quyền trên quần đảo Trường Sa, tiền tiêu trên biển Tổ quốc.' }
  ];
  MARKS.forEach(function (m) {
    BY[m.id] = { id: m.id, isl: 1, name: { vi: m.n, en: m.n, zh: m.n }, sub: { vi: m.sub }, desc: { vi: m.desc, en: m.desc, zh: m.desc }, minK: m.lm ? 1.45 : 1.15 };
  });

  // Lệch nhãn tay (đơn vị: cỡ chữ tỉnh) cho tỉnh có công trình khó tách
  const NUDGE = { hue: [0, 1.25] };
  // Tỉnh neo nhãn lên trên một công trình cụ thể: Cần Thơ neo trên icon Cầu Cần Thơ & Chợ Nổi
  const AT = { cantho: 'cauCanTho' };
  const UI = {
    vi: { close: 'Đóng', load: 'Đang tải bản đồ…', err: 'Không tải được bản đồ', merged: 'Sáp nhập từ: ', same: 'Giữ nguyên địa giới hành chính', eco: 'Kinh tế chủ yếu: ' },
    en: { close: 'Close', load: 'Loading map…', err: 'Could not load the map', merged: 'Merged from: ', same: 'Administrative boundaries unchanged', eco: 'Key economy: ' },
    zh: { close: '关闭', load: '地图加载中…', err: '无法加载地图', merged: '合并自：', same: '行政区划不变', eco: '主要经济：' }
  };
  const SOV = ['Hoàng Sa, Trường Sa', 'là của Việt Nam'];

  function lang() {
    let l = 'vi';
    try { l = localStorage.getItem(LANG_KEY) || 'vi'; } catch (e) {}
    return UI[l] ? l : 'vi';
  }
  function pick(o) { return o[lang()] || o.vi; }
  function se(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function mk(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function fit(ps) { // hồi quy tuyến tính v = a*t + b
    let st = 0, sv = 0, stt = 0, stv = 0; const n = ps.length;
    ps.forEach(function (q) { st += q[0]; sv += q[1]; stt += q[0] * q[0]; stv += q[0] * q[1]; });
    const a = (n * stv - st * sv) / (n * stt - st * st);
    return [a, (sv - a * st) / n];
  }
  function shade(i) {
    const t = ((i * 7) % 10) / 9, m = function (a, b) { return Math.round(a + (b - a) * t); };
    return 'rgb(' + m(6, 4) + ',' + m(78, 120) + ',' + m(59, 87) + ')';
  }

  let stage = null, canvas = null, g = null, mapEl = null, svg = null, vp = null, landEl = null, sovEl = null, dotEl = null, tieEl = null;
  let card = null, cardName = null, cardSt = null, cardReg = null, cardDesc = null, cardX = null, cardEco = null, cardStk = null;
  let raf = 0, last = 0, t = 0, cw = 0, ch = 0, dpr = 1, token = 0, state = 'load', VW = 1, VH = 1;
  let audio = null, openId = null, abortCtl = null, dust = [], rings = [], labels = [], els = {}, sovTs = [];
  let mks = [], lmEl = null, sovKey = '', sovFit = 0; // sovKey/sovFit: cache cỡ chữ khẩu hiệu chủ quyền
  let view = { k: 1, x: 0, y: 0 }, ptr = new Map(), moved = 0, multi = false, pd = 1;

  function initSprites() {
    dust = [];
    for (let i = 0; i < 60; i++) dust.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.5, v: 0.004 + Math.random() * 0.012, ph: Math.random() * 6.28, c: Math.random() < 0.5 ? '#F59E0B' : '#FDE68A' });
    rings = [[0.2, 0.25], [0.85, 0.7], [0.15, 0.85]].map(function (c, i) { return { x: c[0], y: c[1], off: i * 3.3 }; });
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now; t += dt;
    const c = g, big = Math.max(cw, ch);
    c.clearRect(0, 0, cw, ch);
    c.lineWidth = 1;
    rings.forEach(function (o) {
      for (let k = 0; k < 4; k++) {
        const q = ((t + o.off) / 10 + k / 4) % 1;
        c.globalAlpha = (1 - q) * 0.13;
        c.strokeStyle = k % 2 ? '#FBBF24' : '#B45309';
        c.beginPath(); c.arc(o.x * cw, o.y * ch, q * big * 0.55, 0, 6.2832); c.stroke();
      }
    });
    dust.forEach(function (d) {
      d.y -= d.v * dt; if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
      c.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + d.ph));
      c.fillStyle = d.c;
      c.beginPath(); c.arc((d.x + Math.sin(t * 0.3 + d.ph) * 0.01) * cw, d.y * ch, d.r, 0, 6.2832); c.fill();
    });
    c.globalAlpha = 1;
  }

  function onResize() {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = r.width; ch = r.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyView();
  }

  // ---- Zoom / Pan ----
  function unit() { return svg ? (svg.getBoundingClientRect().width / VW) || 1 : 1; }
  // Cỡ chữ khẩu hiệu chủ quyền (px màn hình). PC: 26–34px theo kích thước bản đồ.
  // Mobile: tối đa 17px (như cũ), tự thu nhỏ để dòng dài nhất chỉ chiếm ≤ 86% dải biển trống bên phải bờ biển
  // (từ kinh độ 109.8 đến mép phải bản đồ, đối xứng quanh tâm khẩu hiệu) nên máy hẹp như iPhone SE vẫn gọn.
  function sovSize(narrow, un) {
    if (!narrow) return Math.min(34, Math.max(26, un * VW * 0.035));
    let w1 = Math.max.apply(null, SOV.map(function (s) { return s.length; })) * 0.58; // dự phòng: ≈ 0.58 × cỡ chữ mỗi ký tự
    try {
      sovEl.style.fontSize = '100px';
      const bw = sovEl.getBBox().width; // bề rộng dòng dài nhất ở cỡ 100 → tỉ lệ bề rộng / cỡ chữ
      if (bw > 0) w1 = bw / 100;
    } catch (e) {}
    const cx = parseFloat(sovEl.getAttribute('x')) || VW / 2, lo = (109.8 - GEO.lon0) * KX * S + PAD, hi = VW - 12;
    const room = 2 * Math.max(0, Math.min(cx - lo, hi - cx)) * un;
    return Math.max(11, Math.min(17, 0.86 * room / w1));
  }
  function applyView() {
    if (!vp) return;
    const k = view.k;
    view.x = Math.min(0, Math.max(VW * (1 - k), view.x));
    view.y = Math.min(0, Math.max(VH * (1 - k), view.y));
    vp.setAttribute('transform', 'translate(' + view.x.toFixed(1) + ' ' + view.y.toFixed(1) + ') scale(' + k.toFixed(3) + ')');
    // Cỡ chữ nhãn giữ theo px màn hình (nghịch đảo với zoom): tăng nhẹ theo k, không teo khi zoom ra
    // Cỡ chữ trên màn hình = 15px × min(zoom, 6)^0.45: tăng rõ theo zoom, không teo khi zoom ra.
    // Viền tính theo px màn hình (3.5px, tăng nhẹ theo cỡ chữ), quy đổi về đơn vị SVG bằng unit*k.
    // Màn hình mobile (≤768px): cỡ chữ ≈ 0.6 lần, tăng theo zoom chậm hơn và dừng sớm hơn để các tên sát nhau không đè
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const kz = Math.min(k, narrow ? 4 : 6), px = (narrow ? 9 : 15) * Math.pow(kz, narrow ? 0.35 : 0.45), u = unit() * k;
    const fs = px / u, sw = ((3.5 + (px - 15) * 0.1) / u).toFixed(3) + 'px', all = k > 1.35;
    // Icon công trình (scale ico); tỉnh có công trình được đẩy nhãn lên cao hơn đỉnh icon để không bị che
    // Mobile: icon công trình nhỏ hơn ~0.7 lần và tăng theo zoom chậm hơn
    const ico = (narrow ? 1.75 : 2.5) / (unit() * Math.pow(k, narrow ? 0.5 : 0.6)), liftY = 8 * ico + fs * 0.7;
    labels.forEach(function (l) {
      // Tỉnh nhỏ (ĐB sông Hồng, miền Tây) ẩn nhãn ở mức zoom mặc định, chỉ hiện khi zoom > 1.35
      const p = BY[l.id], crowded = (!all && p && (p.reg === 1 || p.reg === 6)) || (p && p.minK && k < p.minK);
      l.el.style.display = crowded ? 'none' : '';
      l.el.style.fontSize = fs.toFixed(1) + 'px';
      l.el.style.strokeWidth = sw;
      // Tỉnh có công trình: nhãn đẩy lên trên để không bị icon/tên công trình che
      if (l.y0 !== undefined) {
        const nd = NUDGE[l.id] || [0, 0], am = AT[l.id] && mks.find(function (m) { return m.id === AT[l.id]; });
        if (am) { // nhãn nằm hẳn phía trên icon công trình, cách icon một khoảng hở ≈ cỡ chữ
          l.el.setAttribute('x', am.x.toFixed(1));
          l.el.setAttribute('y', (am.y - 7 * ico - fs).toFixed(1));
        } else {
          l.el.setAttribute('x', (l.x0 + nd[0] * fs).toFixed(1));
          l.el.setAttribute('y', (l.y0 - (l.lift ? liftY : 0) + nd[1] * fs).toFixed(1));
        }
      }
    });
    // Icon giữ kích thước gần đều trên màn hình; lớp công trình hiện khi zoom >= 1.45
    // Công trình to hơn ~1.4x so với trước; icon và nhãn cùng scale mượt theo zoom
    const sc = ico, lfs = fs * 1.15;
    mks.forEach(function (m) {
      m.g.setAttribute('transform', 'translate(' + m.x.toFixed(1) + ' ' + m.y.toFixed(1) + ') scale(' + sc.toFixed(3) + ')');
      // Nhãn công trình (lớn hơn nhãn tỉnh) nằm dưới icon
      m.lb.style.fontSize = lfs.toFixed(1) + 'px';
      // Tên công trình không hiển thị trên bản đồ (vẫn chạm icon để xem thẻ thông tin)
      if (m.lm) m.lb.style.display = 'none';
      const extraY = m.id === 'ngomon' ? 7 * sc : 0;
      m.lb.setAttribute('y', (m.y + 8 * sc + extraY + lfs * 0.95).toFixed(1));
    });
    if (lmEl) lmEl.classList.toggle('on', k >= 1.45);
    if (sovEl) {
      // Khẩu hiệu "Hoàng Sa, Trường Sa / là của Việt Nam" nằm gọn trong dải biển bên phải bản đồ.
      // Cỡ chữ và độ giãn dòng tính theo px màn hình rồi quy về đơn vị SVG; dy là số thuần (không dùng em)
      // nên hai dòng không đè nhau ở mọi mức zoom. PC: giãn dòng 1.25; mobile: 1.75 (thoáng hẳn, không dính chữ).
      const un = u / k, key = (narrow ? 'm' : 'd') + un.toFixed(4);
      if (key !== sovKey) { sovKey = key; sovFit = sovSize(narrow, un); } // chỉ tính lại khi đổi khổ màn hình / xoay máy
      const fu = sovFit / u, gap = (fu * (narrow ? 1.75 : 1.25)).toFixed(1);
      sovEl.style.fontSize = fu.toFixed(1) + 'px';
      sovTs.forEach(function (ts, i) { if (i) ts.setAttribute('dy', gap); });
    }
    if (openId) placeCard();
  }
  function zoomAt(cx, cy, f) {
    const r = svg.getBoundingClientRect(), u = r.width / VW, nk = Math.min(8, Math.max(1, view.k * f));
    const px = (cx - r.left) / u, py = (cy - r.top) / u;
    view.x = px - (px - view.x) * nk / view.k;
    view.y = py - (py - view.y) * nk / view.k;
    view.k = nk;
    applyView();
  }
  function pan(dx, dy) { const u = unit(); view.x += dx / u; view.y += dy / u; applyView(); }
  function dist() { const a = Array.from(ptr.values()); return Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) || 1; }
  function mid() { const a = Array.from(ptr.values()); return [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2]; }
  function onDown(e) {
    ptr.set(e.pointerId, [e.clientX, e.clientY]);
    try { mapEl.setPointerCapture(e.pointerId); } catch (x) {}
    if (ptr.size === 1) { moved = 0; multi = false; } else if (ptr.size === 2) { multi = true; pd = dist(); }
  }
  function onMove(e) {
    if (!svg || !ptr.has(e.pointerId)) return;
    const o = ptr.get(e.pointerId);
    if (ptr.size === 1) {
      moved += Math.abs(e.clientX - o[0]) + Math.abs(e.clientY - o[1]);
      ptr.set(e.pointerId, [e.clientX, e.clientY]);
      if (moved > 8) pan(e.clientX - o[0], e.clientY - o[1]);
    } else if (ptr.size === 2) {
      const m0 = mid();
      ptr.set(e.pointerId, [e.clientX, e.clientY]);
      const m1 = mid(), nd = dist();
      pan(m1[0] - m0[0], m1[1] - m0[1]);
      zoomAt(m1[0], m1[1], nd / pd);
      pd = nd;
    }
  }
  function onUp(e) {
    if (!ptr.has(e.pointerId)) return;
    ptr.delete(e.pointerId);
    if (!multi && moved <= 8 && e.type === 'pointerup') {
      const el = document.elementFromPoint(e.clientX, e.clientY), h = el && el.closest ? el.closest('[data-id]') : null;
      if (h && mapEl.contains(h)) openPin(h.getAttribute('data-id')); else closeCard();
    }
    if (!ptr.size) multi = false;
  }
  function onWheel(e) { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); }

  // ---- Dựng bản đồ ----
  function addShape(parent, id, ds, fill) {
    const gr = se('g', { class: 's4-prov', 'data-id': id }, parent);
    ds.forEach(function (d) { se('path', { d: d, class: 's4-gold' }, gr); });
    ds.forEach(function (d) { se('path', { d: d, class: 's4-fill', fill: fill }, gr); });
    els[id] = gr;
    return gr;
  }
  // Điểm đảo (luôn hiện) và mô hình công trình (lớp .vn-landmarks, hiện khi zoom >= 1.45)
  function marks(parent) {
    lmEl = se('g', { class: 'vn-landmarks' }, parent);
    const ptEl = se('g', {}, parent);
    MARKS.forEach(function (m) {
      const gx = (m.lon - GEO.lon0) * KX * S + PAD, gy = (GEO.lat1 - m.lat) * S + PAD;
      const g2 = se('g', { class: 's4-prov', 'data-id': m.id }, m.lm ? lmEl : ptEl);
      const inner = se('g', {}, g2);
      se('circle', { r: 8, class: 's4-hit-pt' }, inner);
      se('path', { d: m.d, class: 's4-ic' }, inner);
      const lb = se('text', { x: gx.toFixed(1), y: gy.toFixed(1), 'text-anchor': 'middle', class: 's4-lb' }, parent);
      els[m.id] = g2;
      labels.push({ id: m.id, el: lb });
      mks.push({ id: m.id, g: inner, lb: lb, x: gx, y: gy, lm: !!m.lm });
    });
  }
  function islands(parent) {
    ISL.forEach(function (o) {
      let sd = o.seed;
      const rnd = function () { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const b = o.box, cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2, rx = (b[1] - b[0]) / 2, ry = (b[3] - b[2]) / 2;
      const gx = function (lon) { return (lon - GEO.lon0) * KX * S + PAD; }, gy = function (lat) { return (GEO.lat1 - lat) * S + PAD; };
      const ds = [];
      for (let i = 0; i < o.cnt; i++) {
        const a = rnd() * 6.283, d = Math.sqrt(rnd()), x = cx + Math.cos(a) * d * rx, y = cy + Math.sin(a) * d * ry, r = 0.05 + rnd() * 0.09;
        let s = '';
        for (let j = 0; j < 7; j++) {
          const q = j / 7 * 6.283, rr = r * (0.7 + rnd() * 0.6);
          s += (j ? 'L' : 'M') + gx(x + Math.cos(q) * rr).toFixed(1) + ' ' + gy(y + Math.sin(q) * rr).toFixed(1);
        }
        ds.push(s + 'Z');
      }
      const gr = addShape(parent, o.id, ds, '#047857');
      gr.insertBefore(se('ellipse', { cx: gx(cx), cy: gy(cy), rx: (rx + 0.2) * KX * S, ry: (ry + 0.2) * S, class: 's4-hit' }), gr.firstChild);
      const lb = se('text', { x: gx(cx), y: gy(b[2]) + 22, 'text-anchor': 'middle', class: 's4-lb' }, vp);
      labels.push({ id: o.id, el: lb });
    });
  }

  function buildMap(data) {
    const feats = []; let proj = false, mnx = 1e18, mxx = -1e18, mny = 1e18, mxy = -1e18;
    (data.features || []).forEach(function (f) {
      const gm = f && f.geometry;
      if (!gm || !gm.coordinates) return;
      const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.type === 'MultiPolygon' ? gm.coordinates : [];
      const pr = f.properties || {}, nm = pr.name || pr['hc-key'] || '';
      let x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18;
      polys.forEach(function (po) { po.forEach(function (rg) { rg.forEach(function (p) {
        if (Math.abs(p[0]) > 360 || Math.abs(p[1]) > 360) proj = true;
        if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
        if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
      }); }); });
      if (x0 > x1) return;
      mnx = Math.min(mnx, x0); mxx = Math.max(mxx, x1); mny = Math.min(mny, y0); mxy = Math.max(mxy, y1);
      feats.push({ key: norm(nm), nm: nm, polys: polys, c: [(x0 + x1) / 2, (y0 + y1) / 2] });
    });
    if (!feats.length) throw new Error('empty');
    let ll = function (p) { return p; };
    if (proj) { // dữ liệu đã chiếu: hồi quy về kinh/vĩ độ
      const m = feats.filter(function (f) { return ANC[f.key]; });
      let fx, fy;
      if (m.length >= 4) {
        fx = fit(m.map(function (f) { return [ANC[f.key][0], f.c[0]]; }));
        fy = fit(m.map(function (f) { return [ANC[f.key][1], f.c[1]]; }));
      } else {
        const a = (mxx - mnx) / (109.46 - 102.14), c = (mxy - mny) / (23.39 - 8.56);
        fx = [a, mnx - a * 102.14]; fy = [c, mny - c * 8.56];
      }
      ll = function (p) { return [(p[0] - fx[1]) / fx[0], (p[1] - fy[1]) / fy[0]]; };
    }
    VW = (GEO.lon1 - GEO.lon0) * KX * S + PAD * 2; VH = (GEO.lat1 - GEO.lat0) * S + PAD * 2;
    stage.style.setProperty('--s4-ar', (VW / VH).toFixed(4));
    svg = se('svg', { class: 's4-svg', viewBox: '0 0 ' + VW.toFixed(1) + ' ' + VH.toFixed(1), role: 'img' }, mapEl);
    vp = se('g', {}, svg);
    landEl = se('g', {}, vp);

    const groups = {}, order = [];
    feats.forEach(function (f) {
      let id = K2I[f.key];
      if (!id) { id = 'x' + f.key; BY[id] = BY[id] || { id: id, name: { vi: f.nm, en: f.nm, zh: f.nm }, city: 0, from: '', reg: 0, desc: { vi: '', en: '', zh: '' }, extra: 1 }; }
      const G = groups[id] || (groups[id] = { ds: [], A: 0, sx: 0, sy: 0 });
      if (G.ds.length === 0) order.push(id);
      let d = '';
      f.polys.forEach(function (po) { po.forEach(function (rg, i) {
        const q = rg.map(function (c) { const l = ll(c); return [(l[0] - GEO.lon0) * KX * S + PAD, (GEO.lat1 - l[1]) * S + PAD]; });
        d += 'M' + q.map(function (a) { return a[0].toFixed(1) + ' ' + a[1].toFixed(1); }).join('L') + 'Z';
        if (i) return;
        let a = 0, cx = 0, cy = 0;
        for (let j = 0; j < q.length; j++) {
          const u = q[j], v = q[(j + 1) % q.length], w = u[0] * v[1] - v[0] * u[1];
          a += w; cx += (u[0] + v[0]) * w; cy += (u[1] + v[1]) * w;
        }
        if (a) { const ar = Math.abs(a); G.A += ar; G.sx += cx / (3 * a) * ar; G.sy += cy / (3 * a) * ar; }
      }); });
      G.ds.push(d);
    });
    order.forEach(function (id, i) { addShape(landEl, id, groups[id].ds, shade(i)); });
    islands(landEl);
    order.forEach(function (id) {
      const G = groups[id];
      if (!G.A) return;
      const lb = se('text', { x: (G.sx / G.A).toFixed(1), y: (G.sy / G.A).toFixed(1), 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 's4-lb s4-prv' }, vp);
      labels.push({ id: id, el: lb, x0: G.sx / G.A, y0: G.sy / G.A, up: true });
    });
    marks(vp);
    // Xác định tỉnh chứa từng công trình (kiểm tra điểm trong vùng tô) để đẩy nhãn tỉnh đó lên trên
    const lift = {};
    mks.forEach(function (m) {
      order.forEach(function (id) {
        if (lift[id] || !els[id]) return;
        const fills = els[id].querySelectorAll('.s4-fill');
        for (let i = 0; i < fills.length; i++) {
          let hit = false;
          try { hit = fills[i].isPointInFill(new DOMPoint(m.x, m.y)); } catch (e) {}
          if (hit) { lift[id] = true; return; }
        }
      });
    });
    labels.forEach(function (l) { if (l.y0 !== undefined && (lift[l.id] || NUDGE[l.id])) l.lift = true; });
    // Đưa mọi nhãn lên lớp trên cùng (sau icon công trình) để tên tỉnh/công trình không bị icon đè
    labels.forEach(function (l) { vp.appendChild(l.el); });
    const sx = (113 - GEO.lon0) * KX * S + PAD, sy = (GEO.lat1 - 13.8) * S + PAD;
    sovEl = se('text', { x: sx.toFixed(1), y: sy.toFixed(1), 'text-anchor': 'middle', class: 's4-sov' }, vp);
    sovTs = SOV.map(function (s, i) {
      const ts = se('tspan', i ? { x: sx.toFixed(1), dy: '1.25em' } : {}, sovEl);
      ts.textContent = s;
      return ts;
    });
    mapEl.addEventListener('pointerdown', onDown);
    mapEl.addEventListener('pointermove', onMove);
    mapEl.addEventListener('pointerup', onUp);
    mapEl.addEventListener('pointercancel', onUp);
    mapEl.addEventListener('wheel', onWheel, { passive: false });
    renderTexts();
    applyView();
  }

  function load(tk) {
    abortCtl = typeof AbortController === 'function' ? new AbortController() : null;
    const opt = abortCtl ? { signal: abortCtl.signal } : {};
    let p = Promise.reject();
    SRC.forEach(function (u) {
      p = p.catch(function () {
        return fetch(u, opt).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); });
      });
    });
    p.then(function (data) {
      if (tk !== token || !stage) return;
      buildMap(data);
      state = 'ok';
      renderTexts();
      onResize();
    }).catch(function () {
      if (tk !== token || !stage) return;
      state = 'err';
      renderTexts();
    });
  }

  // ---- Thẻ thông tin ----
  function full(p) {
    const l = lang(), n = pick(p.name);
    if (p.isl || p.extra) return n;
    return l === 'vi' ? (p.city ? 'TP. ' : 'Tỉnh ') + n : l === 'en' ? n + (p.city ? ' City' : ' Province') : n + (p.city ? '市' : '省');
  }
  function fillCard(id) {
    const p = BY[id], L = UI[lang()];
    cardName.textContent = full(p);
    cardSt.textContent = p.isl ? '' : p.from ? L.merged + p.from : L.same;
    cardSt.hidden = !!p.isl;
    cardReg.textContent = p.sub ? pick(p.sub) : pick(p.isl ? SEA : R[p.reg]);
    cardDesc.textContent = pick(p.desc);
    const d = INFO[id];
    cardEco.hidden = !d;
    cardEco.textContent = d ? L.eco + d.e : '';
    cardStk.textContent = '';
    cardStk.hidden = !d;
    if (d) d.s.forEach(function (t) { mk('span', 's4-stk', cardStk).textContent = t; });
    cardX.setAttribute('aria-label', L.close);
  }
  function setSel(id) {
    Object.keys(els).forEach(function (k) { els[k].classList.toggle('s4-sel', k === id); });
    if (id && els[id]) els[id].parentNode.appendChild(els[id]);
  }
  function closeCard() {
    openId = null;
    if (card) card.hidden = true;
    if (dotEl) dotEl.hidden = true;
    if (tieEl) tieEl.hidden = true;
    setSel(null);
  }
  function openPin(id) {
    if (!BY[id]) return;
    if (openId === id) { closeCard(); return; }
    openId = id;
    fillCard(id);
    card.hidden = false;
    setSel(id);
    placeCard();
    pluck(id.charCodeAt(0) + id.length);
  }
  // Đặt thẻ sát tỉnh vừa chạm: bên phải/trái tỉnh tùy chỗ trống, kẹp trong lề 12px, nối bằng chấm + vạch
  function placeCard() {
    if (!openId || !card || !svg || !els[openId] || !dotEl) return;
    const el = els[openId], ctm = el.getScreenCTM();
    if (!ctm) return;
    const sr = stage.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight, M = 12, G = 18;
    const b = el.getBBox(), p = svg.createSVGPoint();
    p.x = b.x + b.width / 2; p.y = b.y + b.height / 2;
    const q = p.matrixTransform(ctm), ax = q.x, ay = q.y, cwid = card.offsetWidth, chei = card.offsetHeight;
    const right = ax + G + cwid <= vw - M;
    const L = Math.min(Math.max(right ? ax + G : ax - G - cwid, M), vw - M - cwid);
    const T = Math.min(Math.max(ay - chei / 2, M), vh - M - chei);
    const edge = right ? L : L + cwid;
    card.dataset.side = right ? 'r' : 'l';
    card.style.left = (L - sr.left) + 'px';
    card.style.top = (T - sr.top) + 'px';
    card.style.setProperty('--tail-y', (ay - T) + 'px');
    dotEl.style.left = (ax - sr.left) + 'px';
    dotEl.style.top = (ay - sr.top) + 'px';
    dotEl.hidden = false;
    tieEl.style.left = (Math.min(ax, edge) - sr.left) + 'px';
    tieEl.style.top = (ay - sr.top) + 'px';
    tieEl.style.width = Math.abs(edge - ax) + 'px';
    tieEl.hidden = false;
  }
  function onKey(e) { if (e.key === 'Escape' && openId) closeCard(); }

  function renderTexts() {
    if (!stage) return;
    const L = UI[lang()];
    labels.forEach(function (l) {
      const nm = pick(BY[l.id].name);
      l.el.textContent = l.up ? nm.toUpperCase() : nm; // tên tỉnh in hoa toàn bộ
    });
    if (openId) fillCard(openId); else cardX.setAttribute('aria-label', L.close);
  }

  // Tiếng gảy đàn tranh ngũ cung
  function pluck(n) {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t0 = audio.currentTime, f = FREQ[n % FREQ.length];
      [[1, 'triangle', 0.22, 1.6], [2, 'sine', 0.08, 1.1], [3.01, 'sine', 0.03, 0.7]].forEach(function (h) {
        const o = audio.createOscillator(), gn = audio.createGain();
        o.type = h[1]; o.frequency.setValueAtTime(f * h[0] * 1.012, t0);
        o.frequency.exponentialRampToValueAtTime(f * h[0], t0 + 0.06);
        gn.gain.setValueAtTime(0.0001, t0);
        gn.gain.exponentialRampToValueAtTime(h[2], t0 + 0.008);
        gn.gain.exponentialRampToValueAtTime(0.0001, t0 + h[3]);
        o.connect(gn); gn.connect(audio.destination);
        o.start(t0); o.stop(t0 + h[3] + 0.05);
      });
    } catch (e) {}
  }

  function mount() {
    if (stage) return;
    stage = mk('div', 's4-stage');
    stage.id = 's4-stage';
    canvas = mk('canvas', 's4-canvas', stage);
    canvas.setAttribute('aria-hidden', 'true');
    g = canvas.getContext('2d');
    mapEl = mk('div', 's4-map', stage);
    card = mk('div', 's4-card', stage);
    card.hidden = true;
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-live', 'polite');
    const head = mk('div', 's4-card-head', card);
    cardName = mk('strong', 's4-card-name', head);
    cardX = mk('button', 's4-card-x', head);
    cardX.type = 'button';
    cardX.textContent = '✕';
    cardSt = mk('p', 's4-card-st', card);
    cardReg = mk('p', 's4-card-reg', card);
    cardDesc = mk('p', 's4-card-desc', card);
    cardEco = mk('p', 's4-card-eco', card);
    cardEco.hidden = true;
    cardStk = mk('div', 's4-card-stk', card);
    cardStk.hidden = true;
    dotEl = mk('div', 's4-dot', stage);
    dotEl.hidden = true;
    tieEl = mk('div', 's4-tie', stage);
    tieEl.hidden = true;
    cardX.addEventListener('click', closeCard);
    window.addEventListener('resize', onResize);
    window.addEventListener('cgor-lang', renderTexts);
    window.addEventListener('keydown', onKey);
    document.body.appendChild(stage);
    state = 'load';
    view = { k: 1, x: 0, y: 0 };
    initSprites();
    renderTexts();
    onResize();
    token++;
    load(token);
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function unmount() {
    token++;
    if (abortCtl) { try { abortCtl.abort(); } catch (e) {} abortCtl = null; }
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener('resize', onResize);
    window.removeEventListener('cgor-lang', renderTexts);
    window.removeEventListener('keydown', onKey);
    if (mapEl) {
      mapEl.removeEventListener('pointerdown', onDown);
      mapEl.removeEventListener('pointermove', onMove);
      mapEl.removeEventListener('pointerup', onUp);
      mapEl.removeEventListener('pointercancel', onUp);
      mapEl.removeEventListener('wheel', onWheel);
    }
    if (cardX) cardX.removeEventListener('click', closeCard);
    if (audio) { audio.close().catch(function () {}); audio = null; }
    if (stage) stage.remove();
    stage = canvas = g = mapEl = svg = vp = landEl = sovEl = card = cardName = cardSt = cardReg = cardDesc = cardX = null;
    dotEl = tieEl = cardEco = cardStk = null;
    dust = []; rings = []; labels = []; els = {}; sovTs = []; mks = []; lmEl = null; sovKey = ''; sovFit = 0;
    ptr.clear();
    openId = null;
  }

  window.CGOR_SPACES = window.CGOR_SPACES || {};
  window.CGOR_SPACES.space4 = { mount: mount, unmount: unmount };
})();