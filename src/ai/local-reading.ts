import { BRANCH_NAMES } from '../engine/constants.js';

export interface InterpretationRule {
  id: string;
  topic: string;
  palace: string;
  starIds: string[];
  kind: 'positive' | 'caution' | 'context';
  text: string;
}

interface InterpretationDatabase {
  topics: Record<string, { label: string; palaces: string[] }>;
  rules: InterpretationRule[];
  palaceProfiles: Record<string, string>;
  starProfiles: Record<string, { name: string; core: string; strength: string; watchout: string }>;
  transformationProfiles: Record<string, { name: string; kind: InterpretationRule['kind']; text: string }>;
  palaceModifiers: {
    tuan: string;
    triet: string;
    brightness: Record<string, string>;
    tuanByPalace?: Record<string, string>;
    trietByPalace?: Record<string, string>;
    voidEffects?: VoidEffectsConfig;
  };
  combinationRules: Array<InterpretationRule & { palaces: string[]; scope: 'same_palace' | 'tam_phuong' | 'tam_phuong_tu_chinh' }>;
  starPalaceProfiles?: Record<string, Record<string, string>>;
  starCombinations?: Array<{ id: string; name: string; kind: string; starIds: string[]; branches?: string[]; text: string }>;
  starClasses: {
    mainStarIds: string[];
    transformationIds: string[];
    placementLabels: Record<string, string>;
    emptyPalaceNote: string;
  };
}

interface VoidKindTexts {
  nature: string; mainStrong: string; mainWeak: string; mainMid: string; mainUnknown: string;
  sat: string; support: string; peach: string; transformation: string; combo: string; empty: string;
}

interface VoidEffectsConfig {
  classes: { satStarIds: string[]; supportStarIds: string[]; peachStarIds: string[]; strongBrightness: string[]; weakBrightness: string[] };
  kinds: Record<'Tuần' | 'Triệt', VoidKindTexts>;
  both: string;
  closing: string;
}

interface ReadingStar {
  id?: string;
  name?: string;
  scope?: string;
  brightness?: string;
  brightnessStatus?: string;
}

interface ReadingPalace {
  name?: string;
  branch?: string;
  isMenh?: boolean;
  isThan?: boolean;
  hasTuan?: boolean;
  hasTriet?: boolean;
  stars?: ReadingStar[];
}

interface ReadingChart {
  palaces?: ReadingPalace[];
  greatFortuneCurrent?: { startAge?: number; endAge?: number; palace?: string } | null;
  minorFortuneCurrent?: { palace?: string } | null;
}

const TOPIC_ORDER = ['chart_foundation', 'personal_family', 'career_finance', 'love', 'environment', 'health'];
const TOPIC_TITLES: Record<string, string> = {
  chart_foundation: 'Mệnh và nền tảng cá nhân',
  personal_family: 'Gia đình và nền tảng',
  love: 'Tình cảm và con cái',
  career_finance: 'Sự nghiệp, tài chính và học vấn',
  environment: 'Quan hệ xã hội và môi trường',
  health: 'Chăm sóc bản thân',
};

function relatedPalace(chart: ReadingChart, palace: ReadingPalace, offset: number): ReadingPalace | undefined {
  if (!palace.branch || !BRANCH_NAMES.includes(palace.branch as typeof BRANCH_NAMES[number])) return undefined;
  const branchIndex = BRANCH_NAMES.indexOf(palace.branch as typeof BRANCH_NAMES[number]);
  const branch = BRANCH_NAMES[(branchIndex + offset) % 12];
  return (chart.palaces ?? []).find(item => item.branch === branch);
}

function mainStarsIn(palace: ReadingPalace | undefined, db: InterpretationDatabase): ReadingStar[] {
  return (palace?.stars ?? []).filter(star => star.scope === 'natal' && star.id && db.starClasses.mainStarIds.includes(star.id));
}

function describeMainStars(palace: ReadingPalace | undefined, db: InterpretationDatabase): string {
  const stars = mainStarsIn(palace, db).map(star => star.name).filter(Boolean);
  if (stars.length === 0) return 'vô chính diệu';
  if (stars.length === 1) return `${stars[0]} tọa thủ`;
  return `${stars.join(' và ')} đồng cung`;
}

function describeVoidEffectLegacy(
    label: 'Tuần' | 'Triệt',
    palaceName: string,
    natalStars: ReadingStar[],
    profiledStars: Array<{ star: ReadingStar; profile: InterpretationDatabase['starProfiles'][string] }>,
    samePalaceCombinations: InterpretationDatabase['combinationRules'],
    db: InterpretationDatabase,
): string {
  const specificNote = label === 'Tuần'
      ? db.palaceModifiers.tuanByPalace?.[palaceName]
      : db.palaceModifiers.trietByPalace?.[palaceName];
  const baseNote = label === 'Tuần' ? db.palaceModifiers.tuan : db.palaceModifiers.triet;
  const names = natalStars.map(star => star.name).filter((name): name is string => Boolean(name));
  const starList = names.length ? names.join('、') : 'không có sao bản mệnh đồng cung';
  const starFunctions = profiledStars.map(({ profile }) => `${profile.name} (${profile.core.replace(/\.$/, '')})`);
  const functionText = starFunctions.length
      ? ` Các sao có mô tả trong kho cho thấy những chức năng đang được tác động gồm ${starFunctions.join('; ')}.`
      : '';
  const transformationText = natalStars.flatMap(star => star.id && db.transformationProfiles[star.id]
      ? [`${star.name ?? db.transformationProfiles[star.id]!.name}: ${db.transformationProfiles[star.id]!.text}`]
      : []);
  const transformationContext = transformationText.length
      ? ` Tứ Hóa đồng cung cũng thuộc tổ hợp đang xét: ${transformationText.join(' ')}`
      : '';
  const combinationText = samePalaceCombinations.length
      ? ` Khi xét đúng các tổ hợp đồng cung đã nhận diện: ${samePalaceCombinations.map(rule => rule.text).join(' ')}.`
      : '';
  const roleText = specificNote ?? `Trọng tâm của cung là ${db.palaceProfiles[palaceName] ?? palaceName.toLowerCase()}.`;

  if (!names.length) {
    return `**Luận ${label}:** ${label === 'Tuần'
        ? 'Tuần làm nhịp biểu hiện của cung này chậm hoặc không liền mạch'
        : 'Triệt tạo điểm ngắt và đòi hỏi điều chỉnh trong cung này'}; ${roleText} Cung hiện vô chính diệu nên cần phối hợp chính tinh ở đối cung cùng toàn bộ tam phương tứ chính trước khi xác định phần nào được giảm lực hay gặp trở ngại. ${baseNote}`;
  }

  const effect = label === 'Tuần'
      ? 'có thể làm các chức năng ấy khởi đầu chậm, tiến triển qua từng chặng hoặc phải thử lại; đồng thời làm dịu bớt biểu hiện quá mạnh của sao bất lợi'
      : 'có thể khiến các chức năng ấy gặp điểm ngắt, phải đổi cách làm hoặc khó duy trì một mạch; đồng thời có thể chặn bớt đà biểu hiện quá mạnh của sao bất lợi';
  return `**Luận ${label}:** ${label} án tại cung ${palaceName}, cùng tác động lên toàn bộ nhóm sao bản mệnh đồng cung gồm ${starList}. ${roleText}${functionText}${transformationContext} Vì vậy ${effect}.${combinationText} Đây là cách đọc ${label} như yếu tố điều chỉnh cả tổ hợp trong cung, không xóa ý nghĩa từng sao hay kết luận tốt/xấu chỉ từ ${label}; cần đối chiếu thêm chính tinh đối cung và tam phương tứ chính. ${baseNote}`;
}

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

function firstClause(text: string): string {
  return text.split(/[;.]/)[0]!.trim();
}

/**
 * Luận Tuần/Triệt như yếu tố điều chỉnh cả cung: phân nhóm sao đồng cung
 * (chính tinh theo độ sáng có trên lá số, sát tinh, hỗ trợ, đào hoa, Tứ Hóa),
 * nêu vai trò từng chính tinh tại đúng cung, và đọc các bộ sao đồng cung như một khối.
 * Tuần = mờ/chậm; Triệt = ngắt/đổi hướng. Không kết luận tốt/xấu tuyệt đối.
 */
function describeVoidEffect(
    label: 'Tuần' | 'Triệt',
    palace: ReadingPalace,
    palaceName: string,
    natalStars: ReadingStar[],
    profiledStars: Array<{ star: ReadingStar; profile: InterpretationDatabase['starProfiles'][string] }>,
    samePalaceCombinations: InterpretationDatabase['combinationRules'],
    oppositeMainStars: ReadingStar[],
    db: InterpretationDatabase,
): string {
  const cfg = db.palaceModifiers.voidEffects;
  if (!cfg) return describeVoidEffectLegacy(label, palaceName, natalStars, profiledStars, samePalaceCombinations, db);

  const texts = cfg.kinds[label];
  const specificNote = label === 'Tuần'
      ? db.palaceModifiers.tuanByPalace?.[palaceName]
      : db.palaceModifiers.trietByPalace?.[palaceName];
  const roleText = specificNote ?? `Trọng tâm của cung là ${db.palaceProfiles[palaceName] ?? palaceName.toLowerCase()}.`;
  const nameOf = (star: ReadingStar) => star.name ?? star.id ?? '';
  const join = (stars: ReadingStar[]) => stars.map(nameOf).filter(Boolean).join('、');

  const parts: string[] = [`${label} án tại cung ${palaceName}. ${texts.nature} ${roleText}`];

  const mainIds = db.starClasses.mainStarIds;
  const main = natalStars.filter(star => star.id && mainIds.includes(star.id));

  if (!main.length) {
    const opp = oppositeMainStars.length ? ` (${join(oppositeMainStars)})` : '';
    parts.push(fillTemplate(texts.empty, { opp }));
    return `**Luận ${label}:** ${parts[0]}\n${parts.slice(1).map(line => `  - ${line}`).join('\n')}`;
  }

  // Dùng độ sáng đã được tính và truyền cùng sao; chỉ xếp "chưa rõ" khi payload không có nhãn.
  const bucket = { strong: [] as ReadingStar[], weak: [] as ReadingStar[], mid: [] as ReadingStar[], unknown: [] as ReadingStar[] };
  for (const star of main) {
    if (!star.brightness) bucket.unknown.push(star);
    else if (cfg.classes.strongBrightness.includes(star.brightness!)) bucket.strong.push(star);
    else if (cfg.classes.weakBrightness.includes(star.brightness!)) bucket.weak.push(star);
    else bucket.mid.push(star);
  }
  if (bucket.strong.length) parts.push(fillTemplate(texts.mainStrong, { stars: join(bucket.strong) }));
  if (bucket.weak.length) parts.push(fillTemplate(texts.mainWeak, { stars: join(bucket.weak) }));
  if (bucket.mid.length) parts.push(fillTemplate(texts.mainMid, { stars: join(bucket.mid) }));
  if (bucket.unknown.length) parts.push(fillTemplate(texts.mainUnknown, { stars: join(bucket.unknown) }));

  // Chức năng của từng chính tinh tại đúng cung đang xét (bị Tuần/Triệt tác động).
  const roles = main.flatMap(star => {
    const text = star.id ? db.starPalaceProfiles?.[star.id]?.[palaceName] : undefined;
    return text ? [`${nameOf(star)} (${firstClause(text).replace(/^./, c => c.toLowerCase())})`] : [];
  });
  if (roles.length) parts.push(`Chức năng chính tinh đang bị điều chỉnh: ${roles.join('; ')}.`);

  // Các nhóm sao còn lại cùng bị tác động.
  const inClass = (ids: string[]) => natalStars.filter(star => star.id && ids.includes(star.id));
  const groups: Array<[ReadingStar[], keyof VoidKindTexts]> = [
    [inClass(cfg.classes.satStarIds), 'sat'],
    [inClass(cfg.classes.supportStarIds), 'support'],
    [inClass(cfg.classes.peachStarIds), 'peach'],
    [natalStars.filter(star => star.id && db.starClasses.transformationIds.includes(star.id)), 'transformation'],
  ];
  for (const [stars, key] of groups) {
    if (stars.length) parts.push(fillTemplate(texts[key], { stars: join(stars) }));
  }

  // Bộ sao đồng cung đọc như một khối (kiểm tra cả cung địa chi nếu bộ sao chỉ có nghĩa ở vài cung).
  const ids = new Set(natalStars.map(star => star.id).filter((id): id is string => Boolean(id)));
  const blocks = (db.starCombinations ?? [])
      .filter(combo => (combo.kind === 'pair' || combo.kind === 'pattern')
          && combo.starIds.every(id => ids.has(id))
          && (!combo.branches || (palace.branch !== undefined && combo.branches.includes(palace.branch))))
      .slice(0, 2);
  for (const combo of blocks) parts.push(fillTemplate(texts.combo, { name: combo.name, text: combo.text }));
  if (samePalaceCombinations.length) {
    parts.push(`Tổ hợp đồng cung đã nhận diện: ${samePalaceCombinations.map(rule => rule.text).join(' ')}`);
  }

  parts.push(fillTemplate(cfg.closing, { label }));
  return `**Luận ${label}:** ${parts[0]}\n${parts.slice(1).map(line => `  - ${line}`).join('\n')}`;
}

function renderTopic(chart: ReadingChart, topic: string, db: InterpretationDatabase): string[] {
  const topicMeta = db.topics[topic];
  if (!topicMeta) return [];
  const sections: string[] = [`## ${TOPIC_TITLES[topic] ?? topicMeta.label}`];
  let matchedCount = 0;

  if (topic === 'chart_foundation') {
    const menh = (chart.palaces ?? []).find(item => item.isMenh);
    const than = (chart.palaces ?? []).find(item => item.isThan);
    if (menh && than) {
      sections.push(menh.branch === than.branch
          ? '- **Mệnh–Thân:** đồng cung, nên đọc cách thể hiện bản thân cùng hướng dồn sức trong đời sống.'
          : `- **Mệnh–Thân:** Mệnh ở ${menh.branch ?? 'chưa rõ'}, Thân cư ${than.name ?? 'cung chưa rõ'}${than.branch ? ` (${than.branch})` : ''}; đây là lớp đối chiếu về điều bạn chủ động thể hiện và điều thường dành nhiều tâm sức.`);
    }
  }

  for (const palaceName of topicMeta.palaces) {
    const palace = (chart.palaces ?? []).find(item => item.name === palaceName);
    if (!palace) continue;
    const natalStars = (palace.stars ?? []).filter(star => star.scope === 'natal');
    const ids = new Set(natalStars.map(star => star.id).filter((id): id is string => Boolean(id)));
    const matches = db.rules.filter(rule => rule.topic === topic && rule.palace === palaceName && rule.starIds.some(id => ids.has(id)));
    const primaryStars = mainStarsIn(palace, db);
    const nonPrimaryStars = natalStars.filter(star => star.id && !db.starClasses.mainStarIds.includes(star.id) && !db.starClasses.transformationIds.includes(star.id));
    const transformationsInPalace = natalStars.filter(star => star.id && db.starClasses.transformationIds.includes(star.id));
    const oppositePalace = relatedPalace(chart, palace, 6);
    const oppositeMainStars = mainStarsIn(oppositePalace, db);
    const trinePalaces = [relatedPalace(chart, palace, 4), relatedPalace(chart, palace, 8)].filter((item): item is ReadingPalace => Boolean(item));
    const transformations = natalStars.flatMap(star => star.id && db.transformationProfiles[star.id]
        ? [{ star, profile: db.transformationProfiles[star.id] }]
        : []);
    const associatedBranches = palace.branch && BRANCH_NAMES.includes(palace.branch as typeof BRANCH_NAMES[number])
        ? new Set<string>([0, 4, 8].map(offset => BRANCH_NAMES[(BRANCH_NAMES.indexOf(palace.branch as typeof BRANCH_NAMES[number]) + offset) % 12]))
        : new Set<string>();
    const fourPositionBranches = palace.branch && BRANCH_NAMES.includes(palace.branch as typeof BRANCH_NAMES[number])
        ? new Set<string>([0, 4, 6, 8].map(offset => BRANCH_NAMES[(BRANCH_NAMES.indexOf(palace.branch as typeof BRANCH_NAMES[number]) + offset) % 12]))
        : new Set<string>();
    const trineIds = new Set((chart.palaces ?? [])
        .filter(item => item.branch && associatedBranches.has(item.branch))
        .flatMap(item => (item.stars ?? []).filter(star => star.scope === 'natal').map(star => star.id).filter((id): id is string => Boolean(id))));
    const fourPositionIds = new Set((chart.palaces ?? [])
        .filter(item => item.branch && fourPositionBranches.has(item.branch))
        .flatMap(item => (item.stars ?? []).filter(star => star.scope === 'natal').map(star => star.id).filter((id): id is string => Boolean(id))));
    const combinations = db.combinationRules.filter(rule => rule.topic === topic && rule.palaces.includes(palaceName) &&
        rule.starIds.every(id => (rule.scope === 'same_palace' ? ids : rule.scope === 'tam_phuong' ? trineIds : fourPositionIds).has(id)));
    const evidenceStars = natalStars.filter(star => star.id && matches.some(rule => rule.starIds.includes(star.id!)));
    const profiledStars = natalStars.flatMap(star => star.id && db.starProfiles[star.id]
        ? [{ star, profile: db.starProfiles[star.id] }]
        : []);
    const palaceProfile = db.palaceProfiles[palaceName];
    const hasLocalFactors = matches.length > 0 || combinations.length > 0 || profiledStars.length > 0 || transformations.length > 0 || palace.hasTuan || palace.hasTriet;
    if (!hasLocalFactors && !palaceProfile) continue;
    matchedCount += matches.length + combinations.length + profiledStars.length + transformations.length + (palaceProfile ? 1 : 0);
    const branchText = palace.branch ? ` (${palace.branch})` : '';
    sections.push(`### ${palaceName}${branchText}`);
    if (palaceProfile) sections.push(`- **Trọng tâm cung:** ${palaceProfile}`);
    if (primaryStars.length === 1) {
      sections.push(`- **${db.starClasses.placementLabels.oneMainStar}:** ${primaryStars[0]!.name}`);
    } else if (primaryStars.length > 1) {
      sections.push(`- **${db.starClasses.placementLabels.multipleMainStars}:** ${primaryStars.map(star => star.name).filter(Boolean).join('、')}`);
    } else {
      sections.push(`- **${db.starClasses.placementLabels.noMainStar}:** ${db.starClasses.emptyPalaceNote}`);
      if (oppositeMainStars.length) {
        sections.push(`- **Chính tinh mượn đối cung (${oppositePalace?.name}):** ${oppositeMainStars.map(star => star.name).filter(Boolean).join('、')}; xem như căn cứ phối hợp, không thay thế việc xét toàn trục.`);
      } else {
        sections.push('- **Đối cung:** cũng không có chính tinh; không có chính tinh đối cung để mượn theo cách luận thông thường.');
      }
    }
    if (nonPrimaryStars.length) sections.push(`- **${db.starClasses.placementLabels.otherStars}:** ${nonPrimaryStars.map(star => star.name).filter(Boolean).join('、')}`);
    if (transformationsInPalace.length) sections.push(`- **${db.starClasses.placementLabels.transformations}:** ${transformationsInPalace.map(star => star.name).filter(Boolean).join('、')}`);
    if (trinePalaces.length) {
      sections.push(`- **Tam hợp:** ${trinePalaces.map(item => `${item.name}${item.branch ? ` (${item.branch})` : ''} — ${describeMainStars(item, db)}`).join('; ')}.`);
    }
    if (oppositePalace) sections.push(`- **Đối cung:** ${oppositePalace.name}${oppositePalace.branch ? ` (${oppositePalace.branch})` : ''} — ${describeMainStars(oppositePalace, db)}.`);
    if (evidenceStars.length) sections.push(`- **Sao làm căn cứ:** ${evidenceStars.map(star => star.name).filter(Boolean).join('、')}`);
    for (const { star, profile } of profiledStars) {
      const chartBrightness = star.brightness
          ? ` ${star.brightness}: ${db.palaceModifiers.brightness[star.brightness] ?? ''}`
          : '';
      sections.push(`- **${profile.name}:** ${profile.core} Thuận: ${profile.strength} Lưu tâm: ${profile.watchout}${chartBrightness}`);
    }
    for (const { star, profile } of transformations) {
      sections.push(`- **${profile.name}:** ${profile.text}`);
    }
    for (const combination of combinations) {
      const scope = combination.scope === 'same_palace' ? 'Đồng cung' : combination.scope === 'tam_phuong' ? 'Tam phương' : 'Tam phương tứ chính';
      sections.push(`- **${scope}:** ${combination.text}`);
    }
    const samePalaceCombinations = combinations.filter(rule => rule.scope === 'same_palace');
    if (palace.hasTuan) sections.push(`- ${describeVoidEffect('Tuần', palace, palaceName, natalStars, profiledStars, samePalaceCombinations, oppositeMainStars, db)}`);
    if (palace.hasTriet) sections.push(`- ${describeVoidEffect('Triệt', palace, palaceName, natalStars, profiledStars, samePalaceCombinations, oppositeMainStars, db)}`);
    if (palace.hasTuan && palace.hasTriet && db.palaceModifiers.voidEffects) sections.push(`- **Tuần và Triệt đồng cung:** ${db.palaceModifiers.voidEffects.both}`);
    for (const kind of ['positive', 'context', 'caution'] as const) {
      for (const match of matches.filter(rule => rule.kind === kind)) {
        const label = kind === 'positive' ? 'Thuận lợi' : kind === 'caution' ? 'Lưu tâm' : 'Gợi ý chiêm nghiệm';
        sections.push(`- **${label}:** ${match.text}`);
      }
    }
  }

  if (matchedCount === 0) return [];
  return sections;
}

/** Tạo luận giải bằng quy tắc lưu trong ứng dụng, không gọi dịch vụ bên ngoài. */
export function buildLocalReading(chart: ReadingChart, section: string, db: InterpretationDatabase): string {
  if (section === 'great_fortune') {
    const selected = chart.greatFortuneCurrent;
    const age = selected?.startAge != null && selected.endAge != null
        ? ` cho khoảng tuổi ${selected.startAge}–${selected.endAge}`
        : '';
    return `# LUẬN GIẢI ĐẠI VẬN${age}\n\nKho dữ liệu hiện có quy tắc cho sao bản mệnh trong 12 cung, chưa có bộ quy tắc riêng cho sao và Tứ Hóa của từng Đại Vận. Vì vậy chưa thể rút ra xu hướng riêng cho giai đoạn này một cách có căn cứ.\n\n- **Có thể tham khảo:** phần luận bản mệnh theo các cung và sao gốc.\n- **Giới hạn:** nội dung trên không thay cho luận Đại Vận chuyên biệt.`;
  }

  if (section === 'minor_fortune') {
    return `# LUẬN GIẢI TIỂU VẬN\n\nKho dữ liệu hiện chưa có quy tắc diễn giải riêng cho sao lưu niên và Tiểu Vận. Bản dự phòng không suy đoán sự kiện trong năm từ các sao bản mệnh.\n\n- **Có thể tham khảo:** phần luận bản mệnh theo các cung và sao gốc.\n- **Giới hạn:** đây chưa phải luận giải riêng cho năm đang xem.`;
  }

  const selectedTopics = section === 'overview'
      ? TOPIC_ORDER
      : section === 'key_areas'
          ? TOPIC_ORDER.filter(topic => topic !== 'health')
          : db.topics[section] ? [section] : [];

  if (selectedTopics.length === 0) {
    return 'Kho dữ liệu luận giải cục bộ chưa có mục này.';
  }

  const output = [section === 'overview' ? '# TỔNG QUAN LÁ SỐ' : section === 'key_areas' ? '# CÁC PHƯƠNG DIỆN CHÍNH' : `# ${TOPIC_TITLES[section] ?? db.topics[section]?.label ?? section}`];
  let hasContent = false;
  for (const topic of selectedTopics) {
    const topicLines = renderTopic(chart, topic, db);
    if (topicLines.length) {
      output.push(...topicLines, '');
      hasContent = true;
    }
  }

  if (!hasContent) {
    output.push('Chưa có quy tắc khớp với các sao bản mệnh trong mục này. Kho dữ liệu sẽ cần được bổ sung cho các tổ hợp sao tương ứng.');
  }
  output.push('', '---', '*Luận giải tự động từ dữ liệu lưu trong ứng dụng; nội dung Tử Vi mang tính văn hóa tham khảo, không phải dự báo chắc chắn.*');
  output.push('*Kho đã ghép ý nghĩa cung, sao, một số Tứ Hóa, Tuần/Triệt và các tổ hợp tiêu biểu. Chưa bao quát hết các cách cục và biến thể của mọi trường phái.*');
  if (selectedTopics.includes('health')) {
    output.push('*Mục chăm sóc bản thân không chẩn đoán bệnh và không thay thế tư vấn của chuyên gia y tế.*');
  }
  return output.join('\n').trim();
}
