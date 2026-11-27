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
    { id: 'hoang-sa', box: [111.2, 112.8, 15.7, 17.1], n: 8,
      // [kinh độ, vĩ độ, bán kính (độ, phóng đại để nhìn thấy), kiểu: 0 tròn · 1 thuôn ĐB–TN · 2 vành khuyên (atoll)]
      pts: [[112.34, 16.83, 0.13, 1], [112.73, 16.67, 0.09, 1], [112.27, 16.98, 0.05, 0], [112.31, 16.96, 0.05, 0], [112.32, 16.95, 0.05, 0], [112.33, 16.94, 0.05, 0],
        [111.5, 17.09, 0.1, 1], [111.67, 16.25, 0.11, 2], [112.55, 16.04, 0.13, 2],
        [111.61, 16.53, 0.08, 1], [111.51, 16.45, 0.08, 1], [111.58, 16.51, 0.05, 0], [111.74, 16.46, 0.08, 1], [111.71, 16.45, 0.05, 0], [111.77, 16.06, 0.08, 0], [111.2, 15.78, 0.07, 0]],
      name: { vi: 'Quần đảo Hoàng Sa', en: 'Paracel Islands', zh: '西沙群岛' },
      desc: { vi: 'Quần đảo Hoàng Sa — một phần thiêng liêng của lãnh thổ biển đảo Việt Nam.', en: 'The Paracel Islands — a sacred part of Vietnam\'s sea and island territory.', zh: '西沙群岛——越南海洋与岛屿领土的神圣组成部分。' } },
    { id: 'truong-sa', box: [110.3, 116, 7.4, 11.6],n: 9,
      pts: [[114.33, 11.43, 0.09, 1], [114.36, 11.45, 0.05, 0], [114.28, 11.05, 0.08, 0], [114.08, 10.92, 0.13, 2], [114.42, 10.67, 0.08, 0], [115.02, 11.09, 0.07, 0], [115.82, 10.82, 0.07, 0], [115.8, 10.73, 0.06, 0],
        [114.36, 10.38, 0.12, 1], [114.37, 10.18, 0.1, 1], [114.48, 10.38, 0.06, 0], [113.85, 10.06, 0.13, 1], [114.22, 10.21, 0.06, 0], [114.33, 9.88, 0.09, 1], [114.56, 9.9, 0.06, 0], [114.25, 9.77, 0.06, 0], [114.37, 9.78, 0.06, 0], [114.28, 9.72, 0.06, 0],
        [112.96, 9.58, 0.14, 1], [115.53, 9.9, 0.14, 2], [115.86, 9.75, 0.07, 0], [114.66, 8.85, 0.11, 2], [113.68, 8.97, 0.07, 0], [113.98, 8.81, 0.07, 0], [114.18, 8.71, 0.07, 0],
        [111.92, 8.64, 0.07, 0], [112.35, 8.94, 0.07, 0], [112.2, 8.85, 0.07, 0], [112.59, 8.83, 0.07, 0], [111.67, 8.68, 0.07, 0], [113.31, 8.17, 0.14, 1], [112.9, 7.89, 0.08, 1],
        [110.62, 7.55, 0.1, 1], [110.55, 8.13, 0.07, 0], [110.62, 8.02, 0.07, 0], [110.48, 7.8, 0.07, 0], [111.72, 7.93, 0.07, 0]],
      name: { vi: 'Quần đảo Trường Sa', en: 'Spratly Islands', zh: '南沙群岛' },
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
  // Bản dịch EN / ZH của INFO_RAW (cùng định dạng id|kinh tế|3 sticker)
  const INFO_EN_RAW = `
hanoi|Finance, technology, trade and cultural tourism|🍜 Hanoi Pho|🏺 Bat Trang Ceramics|💻 Tech & Services
hue|Heritage tourism, urban services, Tam Giang lagoon fisheries|🏯 Heritage Tourism|🐟 Lagoon Fisheries|🌿 Agarwood Craft
laichau|Hydropower, highland agriculture and forestry, eco-tourism|🍵 Shan Tuyet Tea|⚡ Da River Hydropower|🏔️ Eco-tourism
dienbien|Muong Thanh rice, livestock, historical tourism|🌾 Muong Thanh Rice|🐄 Cattle Farming|🏛️ Historical Tourism
sonla|Industrial crops, dairy cows, plateau tourism|🥛 Moc Chau Milk|🍵 Moc Chau Tea|🌸 Moc Chau Plum Blossoms
langson|Agriculture and forestry, border-gate trade, eco-tourism|🌰 Chi Lang Star Anise|🛒 Border-gate Trade|🏔️ Mau Son Mountain
quangninh|Coal, seaports, Ha Long tourism, marine fisheries|⛏️ Coal|🦪 Oysters & Pearls|🚢 Ha Long Tourism
thanhhoa|Nghi Son oil refining, agriculture, marine fisheries|🏭 Nghi Son Refinery|🐟 Sea Fishing|🏖️ Sam Son Beach
nghean|Agriculture, industry, trade, beach tourism|🍊 Xa Doai Oranges|🦑 Cua Lo Seafood|🏖️ Cua Lo Beach
hatinh|Vung Ang steel and deep-water port, agriculture, fisheries|🏭 Vung Ang Steel|🐟 Seafood|🌾 Rice
caobang|Agriculture and forestry, minerals, border tourism|🌰 Trung Khanh Chestnuts|🌿 Medicinal Herbs|💧 Ban Gioc Waterfall
tuyenquang|Agriculture (oranges, tea), hydropower, Na Hang lake tourism|🍊 Song Con Oranges|🍵 Tea|⚡ Tuyen Quang Hydropower
laocai|Apatite mining, tea, Sa Pa tourism|🌄 Sa Pa Terraced Fields|⛏️ Tang Loong Apatite|🍑 Tam Hoa Plums
thainguyen|Metallurgy, minerals, tea, lake tourism|🍵 Tan Cuong Tea|🏭 Thai Nguyen Steel|🏞️ Nui Coc Lake
phutho|Agriculture, food processing, spiritual tourism|🌳 Doan Hung Pomelo|🏛️ Hung Kings Temple|🐓 Muong Chicken
bacninh|Electronics, components, agriculture, craft villages|📱 Electronics & Components|🍒 Luc Ngan Lychee|🎶 Quan Ho Folk Songs
hungyen|Electronics, automobiles, fruit farming|🐉 Hung Yen Longan|🏭 Electronics & Autos|🏯 Pho Hien
haiphong|Seaports, shipbuilding, industry, beach tourism|⚓ Seaport|🦀 Cat Hai Crab|🏝️ Cat Ba Island
ninhbinh|Heritage tourism, agriculture, building materials|🛶 Trang An|🍚 Ninh Binh Crispy Rice|🏯 Hoa Lu Ancient Capital
quangtri|Heritage tourism, agriculture, fisheries|🏞️ Phong Nha|🌾 Rice|🐟 Cua Viet Seafood
danang|Services, beach tourism, seaports, technology|🏖️ My Khe Beach|🌉 Dragon Bridge|💻 Tech & Seaport
quangngai|Dung Quat oil refining, agriculture, island fisheries|🧄 Ly Son Garlic|🏭 Dung Quat Refinery|🐟 Ly Son Fisheries
gialai|Coffee, rubber, pepper, hydropower, tourism|☕ Coffee|🌶️ Pepper|⚡ Hydropower
khanhhoa|Beach tourism, aquaculture, services|🦞 Lobster|🏖️ Nha Trang Beach|🐦 Bird's Nest
lamdong|High-tech agriculture, Da Lat tourism, hydropower|🌸 Da Lat Flowers|🥬 Da Lat Vegetables|☕ Bao Loc Coffee
daklak|Coffee, rubber, pepper, wind power, tourism|☕ Coffee|🥑 Durian|⚡ Wind Power
hcm|Services, finance, industry, seaports, technology|🏙️ Service Hub|🚢 Cat Lai Port|💻 Tech & Finance
dongnai|Food processing, industrial parks, fruit farming|🍊 Tan Trieu Pomelo|🏭 Industrial Parks|🐔 Poultry Farming
tayninh|Agriculture, rubber, sugarcane, spiritual tourism, border gates|🍠 Cassava|🍘 Trang Bang Rice Paper|🏯 Cao Dai Holy See
cantho|Mekong Delta rice hub, trade, floating-market tourism|🍚 Rice|🛶 Cai Rang Floating Market|🐟 Snakehead Fish
vinhlong|Fruit, coconut, handicrafts, eco-tourism|🥥 Ben Tre Coconut|🍈 Riverine Fruits|🧺 Woven Handicrafts
dongthap|Agriculture, fisheries, lotus|🥭 Cao Lanh Mango|🐟 Pangasius|🌸 Flower Village
camau|Fisheries, mangrove forestry, wind power, gas|🦐 Black Tiger Shrimp|🦀 Sea Crab|🌲 Melaleuca Forest
angiang|Rice, fisheries, border and island tourism|🐟 Pangasius|🌾 Rice|🏝️ Phu Quoc
hoang-sa|Marine economy, traditional fishing grounds, maritime sovereignty|🐟 Rich Fishing Grounds|⚓ Vietnam's Sovereignty|🌊 Marine Economy
truong-sa|Marine economy, traditional fishing grounds, frontier at sea|🐟 Rich Fishing Grounds|⚓ Vietnam's Sovereignty|🌊 Marine Economy
phu-quoc|International island and beach tourism, seaport and seafood processing|🏝️ Pearl Island|🐟 Fish Sauce|🦪 Pearls
con-dao|Marine eco-tourism, nature conservation and historical relics|🐢 Sea Turtles|⚓ Seaport|🌿 National Park
`;
  const INFO_ZH_RAW = `
hanoi|金融、科技、商贸与文化旅游|🍜 河内河粉|🏺 钵场陶瓷|💻 科技与服务
hue|遗产旅游、城市服务、三江潟湖渔业|🏯 遗产旅游|🐟 潟湖渔业|🌿 沉香手艺
laichau|水电、高原农林业、生态旅游|🍵 雪山茶|⚡ 黑河水电|🏔️ 生态旅游
dienbien|芒清稻米、畜牧业、历史旅游|🌾 芒清大米|🐄 养牛业|🏛️ 历史旅游
sonla|工业作物、奶牛、高原旅游|🥛 木州牛奶|🍵 木州茶|🌸 木州李花
langson|农林业、口岸贸易、生态旅游|🌰 支棱八角|🛒 口岸贸易|🏔️ 茅山
quangninh|煤炭、海港、下龙湾旅游、海洋渔业|⛏️ 煤炭|🦪 牡蛎与珍珠|🚢 下龙湾旅游
thanhhoa|宜山炼化、农业、海洋渔业|🏭 宜山炼油厂|🐟 海洋捕捞|🏖️ 参山海滩
nghean|农业、工业、商贸、海滨旅游|🍊 社岱橙|🦑 瓯罗海鲜|🏖️ 瓯罗海滩
hatinh|永昂钢铁与深水港、农业、渔业|🏭 永昂钢铁|🐟 海鲜|🌾 稻米
caobang|农林业、矿产、边境旅游|🌰 重庆板栗|🌿 草药|💧 板约瀑布
tuyenquang|农业（橙、茶）、水电、那汉湖旅游|🍊 松江橙|🍵 茶叶|⚡ 宣光水电
laocai|磷灰石采矿、茶叶、沙坝旅游|🌄 沙坝梯田|⛏️ 层窟磷灰石|🍑 三花李
thainguyen|冶金、矿产、茶叶、湖泊旅游|🍵 新疆茶|🏭 太原钢铁|🏞️ 岑山湖
phutho|农业、农产品加工、灵修旅游|🌳 端雄柚|🏛️ 雄王庙|🐓 芒鸡
bacninh|电子、零部件、农业、工艺村|📱 电子与零部件|🍒 陆岸荔枝|🎶 官贺民歌
hungyen|电子、汽车、水果种植|🐉 兴安龙眼|🏭 电子与汽车|🏯 宪城
haiphong|海港、造船、工业、海滨旅游|⚓ 海港|🦀 吉海蟹|🏝️ 吉婆岛
ninhbinh|遗产旅游、农业、建筑材料|🛶 长安|🍚 宁平锅巴饭|🏯 华闾古都
quangtri|遗产旅游、农业、渔业|🏞️ 峰牙|🌾 稻米|🐟 瓯越海产
danang|服务业、海滨旅游、海港、科技|🏖️ 美溪海滩|🌉 龙桥|💻 科技与海港
quangngai|榕桔炼油、农业、海岛渔业|🧄 李山大蒜|🏭 榕桔炼油厂|🐟 李山渔业
gialai|咖啡、橡胶、胡椒、水电、旅游|☕ 咖啡|🌶️ 胡椒|⚡ 水电
khanhhoa|海滨旅游、水产养殖、服务业|🦞 龙虾|🏖️ 芽庄海滩|🐦 燕窝
lamdong|高科技农业、大叻旅游、水电|🌸 大叻鲜花|🥬 大叻蔬菜|☕ 宝禄咖啡
daklak|咖啡、橡胶、胡椒、风电、旅游|☕ 咖啡|🥑 榴莲|⚡ 风电
hcm|服务业、金融、工业、海港、科技|🏙️ 服务中心|🚢 吉莱港|💻 科技与金融
dongnai|农产品加工、工业园区、水果种植|🍊 新朝柚|🏭 工业园区|🐔 养鸡业
tayninh|农业、橡胶、甘蔗、灵修旅游、口岸|🍠 木薯|🍘 崩崩米纸|🏯 高台教圣地
cantho|湄公河三角洲稻米中心、商贸、水上市场旅游|🍚 稻米|🛶 芽朗水上市场|🐟 乌鱼
vinhlong|水果、椰子、手工艺、生态旅游|🥥 槟椥椰子|🍈 水乡水果|🧺 编织工艺品
dongthap|农业、渔业、莲花|🥭 高岭芒果|🐟 巴沙鱼|🌸 花村
camau|渔业、红树林林业、风电、天然气|🦐 斑节虾|🦀 海蟹|🌲 白千层林
angiang|稻米、渔业、边境与海岛旅游|🐟 巴沙鱼|🌾 稻米|🏝️ 富国岛
hoang-sa|海洋经济、传统渔场、海洋主权|🐟 大渔场|⚓ 越南主权|🌊 海洋经济
truong-sa|海洋经济、传统渔场、海上前哨|🐟 大渔场|⚓ 越南主权|🌊 海洋经济
phu-quoc|国际海岛滨海旅游、海港与海产加工|🏝️ 珍珠岛|🐟 鱼露|🦪 珍珠
con-dao|海洋生态旅游、自然保护与历史遗迹|🐢 海龟|⚓ 海港|🌿 国家公园
`;
  const INFO_L = { vi: INFO };
  [['en', INFO_EN_RAW], ['zh', INFO_ZH_RAW]].forEach(function (pr) {
    const o = INFO_L[pr[0]] = {};
    pr[1].split('\n').forEach(function (r) {
      r = r.trim(); if (!r) return;
      const f = r.split('|'); o[f[0]] = { e: f[1], s: f.slice(2, 5) };
    });
  });
  // 11 đảo / cụm đảo ven bờ + đa giác Côn Đảo. pts: [lon, lat, bán kính (độ, phóng đại), kiểu 0 tròn · 1 thuôn]
  // Hình dạng luôn hiện; nhãn chữ chỉ hiện khi zoom (k > 1.35). Mỗi dòng: n(vi,en,zh) · sub(vi,en,zh) · desc(vi,en,zh) · eco(vi,en,zh) · sticker(vi,en,zh)
  [
    { id: 'con-dao-isl', ref: 'con-dao', pts: [[106.60, 8.68, 0.06, 1], [106.70, 8.72, 0.03, 0], [106.57, 8.72, 0.025, 0], [106.63, 8.64, 0.025, 0]] },
    { id: 'dao-tran', pts: [[107.97, 21.24, 0.05, 1]],
      n: ['Đảo Trần', 'Tran Island', '陈岛'], sub: ['Tỉnh Quảng Ninh', 'Quang Ninh Province', '广宁省'],
      d: ['Đảo tiền tiêu vùng Đông Bắc, nổi tiếng với rừng nguyên sinh và bãi cát trắng.', 'A frontier island in the northeast, known for primeval forest and white sand beaches.', '东北部前哨岛屿，以原始森林和白沙滩闻名。'],
      e: ['Thủy sản, du lịch sinh thái, bảo vệ biên giới biển', 'Fisheries, eco-tourism, maritime border protection', '渔业、生态旅游、海防'], s: [['🌲 Rừng nguyên sinh', '🌲 Primeval forest', '🌲 原始森林'], ['🏖️ Bãi cát trắng', '🏖️ White sands', '🏖️ 白沙滩'], ['🐟 Hải sản', '🐟 Seafood', '🐟 海产']] },
    { id: 'co-to', pts: [[107.76, 20.98, 0.04, 0], [107.72, 21.0, 0.03, 1], [107.80, 20.96, 0.03, 0]],
      n: ['Quần đảo Cô Tô', 'Co To Islands', '古苏群岛'], sub: ['Tỉnh Quảng Ninh', 'Quang Ninh Province', '广宁省'],
      d: ['Quần đảo hoang sơ với bãi biển đẹp, hải đăng Cô Tô và làng chài yên bình.', 'Pristine archipelago with lovely beaches, Co To lighthouse and peaceful fishing villages.', '原始的群岛，拥有美丽海滩、古苏灯塔和宁静渔村。'],
      e: ['Du lịch biển, nuôi trồng và đánh bắt hải sản', 'Beach tourism, aquaculture and fishing', '海滨旅游、水产养殖与捕捞'], s: [['🏖️ Bãi Vàn Chảy', '🏖️ Van Chay beach', '🏖️ 万柴海滩'], ['🗼 Hải đăng Cô Tô', '🗼 Co To lighthouse', '🗼 古苏灯塔'], ['🦑 Mực khô', '🦑 Dried squid', '🦑 鱿鱼干']] },
    { id: 'bach-long-vi', pts: [[107.73, 20.13, 0.045, 0]],
      n: ['Đảo Bạch Long Vĩ', 'Bach Long Vi Island', '白龙尾岛'], sub: ['TP. Hải Phòng', 'Hai Phong City', '海防市'],
      d: ['Đảo xa bờ giữa vịnh Bắc Bộ, tiền tiêu trên biển và ngư trường lớn.', 'A remote island in the Gulf of Tonkin, a frontier outpost and rich fishing ground.', '北部湾中的远海岛屿，海上前哨与大渔场。'],
      e: ['Đánh bắt hải sản xa bờ, dịch vụ hậu cần nghề cá', 'Offshore fishing and fishery logistics', '远海捕捞与渔业后勤'], s: [['🐟 Ngư trường vịnh Bắc Bộ', '🐟 Tonkin Gulf fishery', '🐟 北部湾渔场'], ['⚓ Tiền tiêu biển', '⚓ Sea outpost', '⚓ 海上前哨'], ['🗼 Hải đăng', '🗼 Lighthouse', '🗼 灯塔']] },
    { id: 'hon-me', pts: [[105.93, 19.37, 0.04, 0]],
      n: ['Đảo Hòn Mê', 'Hon Me Island', '洪梅岛'], sub: ['Tỉnh Thanh Hóa', 'Thanh Hoa Province', '清化省'],
      d: ['Hòn đảo nhỏ ngoài khơi Tĩnh Gia với rừng cây xanh và nghề cá truyền thống.', 'A small island off Tinh Gia with green forest and traditional fishing.', '静嘉外海的小岛，森林葱郁，渔业传统悠久。'],
      e: ['Đánh bắt hải sản, du lịch sinh thái', 'Fishing and eco-tourism', '捕捞与生态旅游'], s: [['🐟 Cá biển', '🐟 Sea fish', '🐟 海鱼'], ['🌿 Rừng đảo', '🌿 Island forest', '🌿 岛屿森林'], ['🛶 Làng chài', '🛶 Fishing village', '🛶 渔村']] },
    { id: 'con-co', pts: [[107.34, 17.16, 0.035, 0]],
      n: ['Đảo Cồn Cỏ', 'Con Co Island', '昆草岛'], sub: ['Tỉnh Quảng Trị', 'Quang Tri Province', '广治省'],
      d: ['Đảo tiền tiêu anh hùng nơi cửa ngõ vĩ tuyến 17, nay là điểm du lịch sinh thái.', 'The heroic frontier island at the 17th parallel, now an eco-tourism spot.', '位于十七度线门户的英雄前哨岛，如今是生态旅游地。'],
      e: ['Du lịch lịch sử – sinh thái, đánh bắt hải sản', 'History and eco-tourism, fishing', '历史与生态旅游、捕捞'], s: [['🎖️ Đảo anh hùng', '🎖️ Heroic island', '🎖️ 英雄岛'], ['🌿 Rừng nguyên sinh', '🌿 Primeval forest', '🌿 原始森林'], ['🦑 Mực', '🦑 Squid', '🦑 鱿鱼']] },
    { id: 'cu-lao-cham', pts: [[108.51, 15.95, 0.04, 0], [108.52, 15.97, 0.03, 0], [108.48, 15.94, 0.025, 0]],
      n: ['Cù Lao Chàm', 'Cu Lao Cham', '占婆岛'], sub: ['TP. Đà Nẵng', 'Da Nang City', '岘港市'],
      d: ['Khu dự trữ sinh quyển thế giới với rạn san hô và biển xanh trong vắt.', 'A UNESCO biosphere reserve with coral reefs and crystal-clear sea.', '联合国教科文组织生物圈保护区，珊瑚礁与碧海清澈。'],
      e: ['Du lịch lặn biển, nghề biển, bảo tồn sinh quyển', 'Diving tourism, fishing, biosphere conservation', '潜水旅游、渔业、生物圈保护'], s: [['🪸 San hô', '🪸 Coral reefs', '🪸 珊瑚'], ['🤿 Lặn biển', '🤿 Diving', '🤿 潜水'], ['🦞 Tôm hùm', '🦞 Lobster', '🦞 龙虾']] },
    { id: 'ly-son', pts: [[109.12, 15.38, 0.05, 1], [109.15, 15.39, 0.025, 0]],
      n: ['Đảo Lý Sơn', 'Ly Son Island', '李山岛'], sub: ['Tỉnh Quảng Ngãi (Đảo Lớn & Đảo Bé)', 'Quang Ngai Province (Great & Small Islands)', '广义省（大岛与小岛）'],
      d: ['Đảo núi lửa với đồng tỏi, cổng Tò Vò và truyền thống đội Hoàng Sa.', 'A volcanic island with garlic fields, To Vo arch and the Hoang Sa flotilla heritage.', '火山岛，以大蒜田、拱门及黄沙队传统闻名。'],
      e: ['Trồng tỏi, đánh bắt hải sản, du lịch biển đảo', 'Garlic farming, fishing, island tourism', '种植大蒜、捕捞、海岛旅游'], s: [['🧄 Tỏi Lý Sơn', '🧄 Ly Son garlic', '🧄 李山大蒜'], ['🌋 Núi lửa cổ', '🌋 Ancient volcano', '🌋 古火山'], ['🏝️ Cổng Tò Vò', '🏝️ To Vo arch', '🏝️ 拱门']] },
    { id: 'phu-quy', pts: [[108.94, 10.53, 0.05, 0]],
      n: ['Đảo Phú Quý', 'Phu Quy Island', '富贵岛'], sub: ['Tỉnh Lâm Đồng', 'Lam Dong Province', '林同省'],
      d: ['Đảo ngọc ngoài khơi Phan Thiết với biển xanh, gió điện và hải sản tươi.', 'A pearl island off Phan Thiet with blue sea, wind power and fresh seafood.', '潘切外海的明珠岛，海水湛蓝，有风电与鲜美海产。'],
      e: ['Đánh bắt hải sản, điện gió, du lịch biển', 'Fishing, wind power, beach tourism', '捕捞、风电、海滨旅游'], s: [['🐟 Cá cơm', '🐟 Anchovy', '🐟 鳀鱼'], ['💨 Điện gió', '💨 Wind power', '💨 风电'], ['🏖️ Bãi Cát Cát', '🏖️ Sandy beaches', '🏖️ 沙滩']] },
    { id: 'nam-du', pts: [[104.35, 9.68, 0.04, 0], [104.37, 9.70, 0.025, 0], [104.33, 9.66, 0.02, 0]],
      n: ['Quần đảo Nam Du', 'Nam Du Islands', '南珠群岛'], sub: ['Tỉnh An Giang', 'An Giang Province', '安江省'],
      d: ['Quần đảo gần 21 hòn đảo với bãi đá, rừng và biển trong xanh.', 'An archipelago of about 21 islands with rocky shores, forests and clear water.', '约21座岛屿组成，礁岸、森林与海水清澈。'],
      e: ['Du lịch biển, nuôi cá lồng bè, đánh bắt', 'Beach tourism, cage fish farming, fishing', '海滨旅游、网箱养鱼、捕捞'], s: [['🐟 Cá lồng bè', '🐟 Cage-farmed fish', '🐟 网箱鱼'], ['🪨 Bãi đá', '🪨 Rocky shores', '🪨 礁岸'], ['🦑 Mực', '🦑 Squid', '🦑 鱿鱼']] },
    { id: 'tho-chu', pts: [[103.47, 9.30, 0.05, 0], [103.50, 9.33, 0.02, 0]],
      n: ['Quần đảo Thổ Chu', 'Tho Chu Islands', '土珠群岛'], sub: ['Tỉnh An Giang', 'An Giang Province', '安江省'],
      d: ['Quần đảo xa nhất vùng Tây Nam, tiền tiêu trên biển với ngư trường giàu.', 'The southwestern-most archipelago, a sea outpost with rich fishing grounds.', '西南最远的群岛，海上前哨，渔场丰富。'],
      e: ['Đánh bắt hải sản, bảo vệ chủ quyền biển', 'Fishing and sovereignty protection', '捕捞与海权守护'], s: [['🐟 Ngư trường Tây Nam', '🐟 Southwest fishery', '🐟 西南渔场'], ['⚓ Tiền tiêu biển', '⚓ Sea outpost', '⚓ 海上前哨'], ['🏝️ Bãi hoang sơ', '🏝️ Wild beaches', '🏝️ 原始海滩']] },
    { id: 'hon-khoai', pts: [[104.83, 8.43, 0.04, 0], [104.86, 8.42, 0.02, 0]],
      n: ['Cụm đảo Hòn Khoai', 'Hon Khoai Islands', '芋头岛群'], sub: ['Tỉnh Cà Mau', 'Ca Mau Province', '金瓯省'],
      d: ['Cụm đảo ngoài khơi mũi Cà Mau với hải đăng cổ và rừng nguyên sinh.', 'Islands off Ca Mau Cape with an old lighthouse and primeval forest.', '金瓯角外海岛群，有古灯塔和原始森林。'],
      e: ['Đánh bắt hải sản, du lịch sinh thái, lịch sử', 'Fishing, eco-tourism, history', '捕捞、生态旅游、历史'], s: [['🗼 Hải đăng Hòn Khoai', '🗼 Hon Khoai lighthouse', '🗼 芋头岛灯塔'], ['🌲 Rừng nguyên sinh', '🌲 Primeval forest', '🌲 原始森林'], ['🦀 Hải sản', '🦀 Seafood', '🦀 海产']] }
  ].forEach(function (o) {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    o.pts.forEach(function (p) { x0 = Math.min(x0, p[0] - p[2]); x1 = Math.max(x1, p[0] + p[2]); y0 = Math.min(y0, p[1] - p[2]); y1 = Math.max(y1, p[1] + p[2]); });
    o.box = [x0, x1, y0, y1];
    ISL.push(o);
    if (o.ref) return;
    const li = { vi: 0, en: 1, zh: 2 };
    BY[o.id] = { id: o.id, isl: 1, minK: 1.35, name: { vi: o.n[0], en: o.n[1], zh: o.n[2] }, sub: { vi: o.sub[0], en: o.sub[1], zh: o.sub[2] }, desc: { vi: o.d[0], en: o.d[1], zh: o.d[2] } };
    Object.keys(li).forEach(function (l) { INFO_L[l][o.id] = { e: o.e[li[l]], s: o.s.map(function (t) { return t[li[l]]; }) }; });
  });
  // Bản dịch EN / ZH của 14 điểm MARKS: [tên n, địa danh sub, mô tả desc]
  const MARK_L = {
    'phu-quoc': { en: ['Phu Quoc Island', 'An Giang Province', 'The pearl island in the southwest, famed for its beaches and traditional fish sauce.'], zh: ['富国岛', '安江省', '西南部的明珠岛，以海岛风光和传统鱼露闻名。'] },
    'con-dao': { en: ['Con Dao', 'Ho Chi Minh City', 'An archipelago of rich forests and seas, with many historical relics and Con Dao National Park.'], zh: ['昆岛', '胡志明市', '森林与海域丰饶的群岛，拥有众多历史遗迹和昆岛国家公园。'] },
    'lungcu': { en: ['Lung Cu Flagpole', 'Tuyen Quang Province', 'The national flagpole on the Dong Van karst plateau, a sacred symbol of the northernmost point.'], zh: ['龙渠旗台', '宣光省', '位于同文石高原上的国旗旗台，是神圣的最北端象征。'] },
    'thaprua': { en: ['Turtle Tower & One Pillar Pagoda', 'Hanoi City', 'Hoan Kiem Lake and the One Pillar Pagoda, emblems of ancient Thang Long architecture.'], zh: ['龟塔与独柱寺', '河内市', '还剑湖与独柱寺，是古升龙建筑的象征。'] },
    'hontrongmai': { en: ['Trong Mai Rock (Fighting Cock Islet)', 'Ha Long Bay, Quang Ninh', 'A majestic limestone formation in Ha Long Bay, a UNESCO World Natural Heritage site.'], zh: ['斗鸡石', '广宁省下龙湾', '下龙湾中雄奇的石灰岩山体，世界自然遗产。'] },
    'ngomon': { en: ['Ngo Mon Gate, Imperial City', 'Hue City', 'The main gate of the Hue Imperial City, where royal ceremonies were once held.'], zh: ['午门（顺化皇城）', '顺化市', '顺化皇城正门，昔日举行宫廷典礼之处。'] },
    'cauRong': { en: ['Dragon Bridge & Golden Bridge', 'Da Nang City', 'The Dragon Bridge breathes fire and water on weekends; the Golden Bridge stands in Ba Na Hills.'], zh: ['龙桥与金桥', '岘港市', '龙桥周末喷火喷水；金桥坐落于巴拿山。'] },
    'nharong': { en: ['Central Highlands Rong House', 'Gia Lai Province', 'The Rong House, a communal structure and cultural symbol of the Ba Na and Gia Rai peoples.'], zh: ['西原公房（Rông屋）', '嘉莱省', '公房是巴拿族和嘉莱族的公共建筑与文化象征。'] },
    'ponagar': { en: ['Po Nagar Cham Towers', 'Khanh Hoa Province', 'A Cham tower complex built between the 7th and 13th centuries beside the Cai River, Nha Trang.'], zh: ['婆那加占婆塔', '庆和省', '建于7至13世纪的占婆塔群，位于芽庄盖河畔。'] },
    'landmark81': { en: ['Nha Rong Wharf & Landmark 81', 'Ho Chi Minh City', 'Nha Rong Wharf is a historic site on the Saigon River; Landmark 81 is the tallest building in Vietnam.'], zh: ['龙屋码头与地标81大厦', '胡志明市', '龙屋码头是西贡河畔的历史遗迹；地标81是越南最高的建筑。'] },
    'cauCanTho': { en: ['Can Tho Bridge & Floating Market', 'Can Tho City', 'A cable-stayed bridge over the Hau River, near the bustling Cai Rang floating market.'], zh: ['芹苴大桥与水上市场', '芹苴市', '横跨后江的斜拉桥，毗邻热闹的芽朗水上市场。'] },
    'muiCaMau': { en: ['Ca Mau Cape', 'Ca Mau Province', 'The southernmost point of the country, where the mainland reaches out into the East Sea.'], zh: ['金瓯角', '金瓯省', '祖国最南端，陆地在此伸入东海。'] },
    'mocHoangSa': { en: ['Hoang Sa (Paracel) Sovereignty Marker', 'Hoang Sa (Paracel) Islands', 'A marker affirming Vietnam\'s sovereignty over the Hoang Sa (Paracel) Islands.'], zh: ['西沙群岛主权标志', '西沙群岛（越称黄沙）', '宣示越南对西沙群岛（黄沙）主权的标志。'] },
    'mocTruongSa': { en: ['Truong Sa (Spratly) Sovereignty Marker', 'Truong Sa (Spratly) Islands', 'A marker affirming sovereignty over the Truong Sa (Spratly) Islands, the nation\'s frontier at sea.'], zh: ['南沙群岛主权标志', '南沙群岛（越称长沙）', '宣示对南沙群岛（长沙）主权的标志，祖国海上前哨。'] }
  };
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
    const t = MARK_L[m.id] || {}, en = t.en || [m.n, m.sub, m.desc], zh = t.zh || en;
    BY[m.id] = { id: m.id, isl: 1, name: { vi: m.n, en: en[0], zh: zh[0] }, sub: { vi: m.sub, en: en[1], zh: zh[1] }, desc: { vi: m.desc, en: en[2], zh: zh[2] }, minK: m.lm ? 1.45 : 1.15 };
  });

  // Lệch nhãn tay (đơn vị: cỡ chữ tỉnh) cho tỉnh có công trình khó tách
  const NUDGE = { khanhhoa: [-0.45, 0], hanoi: [0, 0] };
  // Tỉnh neo nhãn lên trên một công trình cụ thể: Cần Thơ neo trên icon Cầu Cần Thơ & Chợ Nổi
  const AT = { cantho: 'cauCanTho', hanoi: 'thaprua', khanhhoa: 'ponagar', hue: 'ngomon' };
  const UNDER = { hanoi: 1, khanhhoa: 1, hue: 1, cantho: 1 }; // nhãn đặt phía dưới icon công trình
  const UI = {
    vi: { close: 'Đóng', load: 'Đang tải bản đồ…', err: 'Không tải được bản đồ', merged: 'Sáp nhập từ: ', same: 'Giữ nguyên địa giới hành chính', eco: 'Kinh tế chủ yếu: ' },
    en: { close: 'Close', load: 'Loading map…', err: 'Could not load the map', merged: 'Merged from: ', same: 'Administrative boundaries unchanged', eco: 'Key economy: ' },
    zh: { close: '关闭', load: '地图加载中…', err: '无法加载地图', merged: '合并自：', same: '行政区划不变', eco: '主要经济：' }
  };
  const SOV_L = {
    vi: ['Hoàng Sa, Trường Sa', 'là của Việt Nam'],
    en: ['Hoang Sa & Truong Sa', 'belong to Vietnam'],
    zh: ['黄沙、长沙群岛', '属于越南']
  };
  let SOV = SOV_L.vi;

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
  let mks = [], lmEl = null, star = null, sovKey = '', sovFit = 0; // sovKey/sovFit: cache cỡ chữ khẩu hiệu chủ quyền
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
  function unit() { if (!svg) return 1; const r = svg.getBoundingClientRect(); return Math.min(r.width / VW, r.height / VH) || 1; }
  // Phần bù (đơn vị SVG) khi khung màn hình rộng/cao hơn tỷ lệ VW/VH (xMidYMid meet)
  function pads() {
    if (!svg) return { u: 1, padX: 0, padY: 0 };
    const r = svg.getBoundingClientRect(), u = Math.min(r.width / VW, r.height / VH) || 1;
    return { u: u, padX: Math.max(0, (r.width / u - VW) / 2), padY: Math.max(0, (r.height / u - VH) / 2) };
  }
  // Cỡ chữ khẩu hiệu chủ quyền (px màn hình). PC: 26–34px theo kích thước bản đồ.
  // Mobile: tối đa 17px (như cũ), tự thu nhỏ để dòng dài nhất chỉ chiếm ≤ 86% dải biển trống bên phải bờ biển
  // (từ kinh độ 109.8 đến mép phải bản đồ, đối xứng quanh tâm khẩu hiệu) nên máy hẹp như iPhone SE vẫn gọn.
  function sovSize(narrow, un) {
    if (!narrow) return Math.min(28, Math.max(21, un * VW * 0.029));
    let w1 = Math.max.apply(null, SOV.map(function (s) { return s.length; })) * 0.58; // dự phòng: ≈ 0.58 × cỡ chữ mỗi ký tự
    try {
      sovEl.style.fontSize = '100px';
      const bw = sovEl.getBBox().width; // bề rộng dòng dài nhất ở cỡ 100 → tỉ lệ bề rộng / cỡ chữ
      if (bw > 0) w1 = bw / 100;
    } catch (e) {}
    const cx = parseFloat(sovEl.getAttribute('x')) || VW / 2, lo = (109.8 - GEO.lon0) * KX * S + PAD, hi = VW - 12;
    const room = 2 * Math.max(0, Math.min(cx - lo, hi - cx)) * un;
    return Math.max(9.5, Math.min(14, 0.76 * room / w1));
  }
  function applyView() {
    if (!vp) return;
    const k = view.k;
    const pd = pads();
    const xlo = VW + pd.padX - VW * k, xhi = -pd.padX, ylo = VH + pd.padY - VH * k, yhi = -pd.padY;
    view.x = xlo > xhi ? (xlo + xhi) / 2 : Math.min(xhi, Math.max(xlo, view.x));
    view.y = ylo > yhi ? (ylo + yhi) / 2 : Math.min(yhi, Math.max(ylo, view.y));
    vp.setAttribute('transform', 'translate(' + view.x.toFixed(1) + ' ' + view.y.toFixed(1) + ') scale(' + k.toFixed(3) + ')');
    // Cỡ chữ nhãn giữ theo px màn hình (nghịch đảo với zoom): tăng nhẹ theo k, không teo khi zoom ra
    // Cỡ chữ trên màn hình = 15px × min(zoom, 6)^0.45: tăng rõ theo zoom, không teo khi zoom ra.
    // Viền tính theo px màn hình (3.5px, tăng nhẹ theo cỡ chữ), quy đổi về đơn vị SVG bằng unit*k.
    // Màn hình mobile (≤768px): cỡ chữ ≈ 0.6 lần, tăng theo zoom chậm hơn và dừng sớm hơn để các tên sát nhau không đè
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    const kz = Math.min(k, narrow ? 4 : 4.5), px = (narrow ? 9 : 10) * Math.pow(kz, narrow ? 0.35 : 0.28), u = unit() * k;
    const fs = px / u, sw = ((3.5 + (px - 15) * 0.1) / u).toFixed(3) + 'px', all = k > 1.35;
    // Icon công trình (scale ico); tỉnh có công trình được đẩy nhãn lên cao hơn đỉnh icon để không bị che
    // Mobile: icon công trình nhỏ hơn ~0.7 lần và tăng theo zoom chậm hơn
    // Zoom gần (k >= 1.45, công trình hiện rõ): đẩy nhãn tỉnh thêm lên, hệ số tăng nhẹ theo k, tối đa ~1 cỡ chữ
    const ico = (narrow ? 1.15 : 2.0) / (unit() * Math.pow(k, 0.5)),
      near = k >= 1.45 ? Math.min(1, 0.35 + (k - 1.45) * 0.3) : 0,
      liftY = 8 * ico + fs * (0.7 + near);
    labels.forEach(function (l) {
      // Tỉnh nhỏ (ĐB sông Hồng, miền Tây) ẩn nhãn ở mức zoom mặc định, chỉ hiện khi zoom > 1.35
      // Chưa zoom: ẩn toàn bộ tên tỉnh, chỉ giữ tên 2 quần đảo (và điểm đảo có minK riêng)
      const p = BY[l.id], crowded = (l.up && !all) || (p && p.minK && (p.minK === 1.35 ? k <= 1.35 : k < p.minK));
      l.el.style.display = crowded ? 'none' : '';
      l.el.style.fontSize = fs.toFixed(1) + 'px';
      l.el.style.strokeWidth = sw;
      // Tỉnh có công trình: nhãn đẩy lên trên để không bị icon/tên công trình che
      if (l.y0 !== undefined) {
        const nd = NUDGE[l.id] || [0, 0], am = AT[l.id] && mks.find(function (m) { return m.id === AT[l.id]; });
        if (am) { // nhãn nằm hẳn phía trên icon công trình, cách icon một khoảng hở ≈ cỡ chữ
          l.el.setAttribute('x', (am.x + (UNDER[l.id] ? nd[0] * fs : 0)).toFixed(1));
          l.el.setAttribute('y', (UNDER[l.id] ? am.y + 8 * ico + fs * 0.75 : am.y - 7 * ico - fs).toFixed(1));
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
    if (star) { // Sao đỏ Thủ đô: luôn hiện, scale mượt theo zoom; khi công trình hiện (k >= 1.45) dịch sang phải icon Tháp Rùa
      // Sao to thêm ~30% (×1.3) ở mọi mức zoom; khoảng cách dịch sang phải giữ nguyên để không chạm icon Tháp Rùa
      const ss = 1.3 * (narrow ? 6.5 : 8) / (8 * unit() * Math.pow(k, 1.45)), hm = mks.find(function (m) { return m.id === 'thaprua'; });
      let sx = star.x, sy = star.y;
      if (all && hm) { // zoom gần: sao nằm ngay dưới chữ HÀ NỘI, thu nhỏ dần theo zoom
        sx = hm.x; sy = hm.y + 8 * ico + fs * 0.75 + fs * 0.95 + 6 * ss;
      }
      star.g.setAttribute('transform', 'translate(' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ') scale(' + ss.toFixed(3) + ')');
    }
    if (sovEl) {
      // Khẩu hiệu "Hoàng Sa, Trường Sa / là của Việt Nam" nằm gọn trong dải biển bên phải bản đồ.
      // Cỡ chữ và độ giãn dòng tính theo px màn hình rồi quy về đơn vị SVG; dy là số thuần (không dùng em)
      // nên hai dòng không đè nhau ở mọi mức zoom. PC: giãn dòng 1.25; mobile: 1.75 (thoáng hẳn, không dính chữ).
      const un = u / k, key = (narrow ? 'm' : 'd') + un.toFixed(4);
      if (key !== sovKey) { sovKey = key; sovFit = sovSize(narrow, un); } // chỉ tính lại khi đổi khổ màn hình / xoay máy
      const fu = sovFit / u, gap = (fu * (narrow ? 2.1 : 1.25)).toFixed(1);
      sovEl.style.fontSize = fu.toFixed(1) + 'px';
      sovTs.forEach(function (ts, i) { if (i) ts.setAttribute('dy', gap); });
    }
    if (openId) placeCard();
  }
  function zoomAt(cx, cy, f) {
    const r = svg.getBoundingClientRect(), pd = pads(), u = pd.u, nk = Math.min(8, Math.max(1, view.k * f));
    const px = (cx - r.left) / u - pd.padX, py = (cy - r.top) / u - pd.padY;
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
    // Sao đỏ 5 cánh tại Hà Nội (ngoài .vn-landmarks nên luôn hiện từ k = 1), chạm để mở thẻ Hà Nội
    let pts = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.1 : 8;
      pts += (i ? ' ' : '') + (Math.cos(a) * r).toFixed(2) + ',' + (Math.sin(a) * r).toFixed(2);
    }
    const sg = se('g', { class: 's4-star', 'data-id': 'hanoi' }, parent), si = se('g', {}, sg);
    se('circle', { r: 10, class: 's4-hit-pt' }, si);
    se('polygon', { points: pts, class: 's4-star-shape' }, si);
    star = { g: si, x: (105.85 - GEO.lon0) * KX * S + PAD, y: (GEO.lat1 - 21.03) * S + PAD };
  }
  function islands(parent) {
    ISL.forEach(function (o) {
      const b = o.box, cx = (b[0] + b[1]) / 2, cy = (b[2] + b[3]) / 2, rx = (b[1] - b[0]) / 2, ry = (b[3] - b[2]) / 2;
      const gx = function (lon) { return (lon - GEO.lon0) * KX * S + PAD; }, gy = function (lat) { return (GEO.lat1 - lat) * S + PAD; };
      const ds = [];
      // Đường bao 14 điểm, gợn nhẹ tất định: tròn / thuôn dài hướng ĐB–TN (kiểu 1) / vành khuyên rỗng ruột (kiểu 2)
      const ring = function (x, y, r, t, k, dir, sgn, ph) {
        const ca = Math.cos(dir), sa = Math.sin(dir);
        let s = '';
        for (let j = 0; j < 14; j++) {
          const q = sgn * j / 14 * 6.283, w = 1 + 0.12 * Math.sin(q * 3 + ph) + 0.07 * Math.sin(q * 5 + ph * 2);
          const ex = Math.cos(q) * r * k * w, ey = Math.sin(q) * r * (t === 1 ? 0.42 : 1) * k * w;
          s += (j ? 'L' : 'M') + gx(x + ex * ca - ey * sa).toFixed(1) + ' ' + gy(y + ex * sa + ey * ca).toFixed(1);
        }
        return s + 'Z';
      };
      o.pts.forEach(function (p, i) {
        const t = p[3], dir = t === 1 ? 0.7 : 0;
        ds.push(ring(p[0], p[1], p[2], t, 1, dir, 1, i));
        if (t === 2) ds.push(ring(p[0], p[1], p[2], t, 0.55, dir, -1, i)); // chiều ngược: lòng hồ rỗng
      });
      const gr = addShape(parent, o.id, ds, '#047857');
      gr.insertBefore(se('ellipse', { cx: gx(cx), cy: gy(cy), rx: (rx + 0.2) * KX * S, ry: (ry + 0.2) * S, class: 's4-hit' }), gr.firstChild);
      if (o.ref) { gr.setAttribute('data-id', o.ref); return; } // đa giác Côn Đảo: chạm mở thẻ Côn Đảo, nhãn dùng điểm đảo sẵn có
      // Nhãn Trường Sa nâng lên 14 đơn vị SVG để không sát mép dưới (tránh vùng safe-area iPhone)
      const lb = se('text', { x: gx(cx), y: gy(b[2]) + 22 - (o.id === 'truong-sa' ? 14 : 0), 'text-anchor': 'middle', class: 's4-lb' }, vp);
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
    svg = se('svg', { class: 's4-svg', viewBox: '0 0 ' + VW.toFixed(1) + ' ' + VH.toFixed(1), preserveAspectRatio: 'xMidYMid meet', role: 'img' }, mapEl);
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
    const d = (INFO_L[lang()] || INFO)[id] || INFO[id];
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
    // Khẩu hiệu chủ quyền theo ngôn ngữ đang chọn (textContent), tính lại cỡ chữ vì độ dài đổi
    SOV = SOV_L[lang()] || SOV_L.vi;
    sovTs.forEach(function (ts, i) { ts.textContent = SOV[i] || ''; });
    sovKey = '';
    applyView();
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
    document.body.classList.add('s4-active');
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
    document.body.classList.remove('s4-active');
    stage = canvas = g = mapEl = svg = vp = landEl = sovEl = card = cardName = cardSt = cardReg = cardDesc = cardX = null;
    dotEl = tieEl = cardEco = cardStk = null;
    dust = []; rings = []; labels = []; els = {}; sovTs = []; mks = []; lmEl = null; star = null; sovKey = ''; sovFit = 0;
    ptr.clear();
    openId = null;
  }

  window.CGOR_SPACES = window.CGOR_SPACES || {};
  window.CGOR_SPACES.space4 = { mount: mount, unmount: unmount };
})();