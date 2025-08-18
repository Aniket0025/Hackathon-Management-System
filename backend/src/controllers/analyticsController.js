const Registration = require('../models/Registration');

// Map normalized skill to category key
const SKILL_TO_CATEGORY = [
  { key: 'frontend', names: ['react', 'next', 'frontend', 'html', 'css', 'javascript', 'typescript', 'vue', 'angular'] },
  { key: 'backend', names: ['backend', 'node', 'express', 'python', 'django', 'flask', 'java', 'spring', 'postgres', 'mongodb', 'sql', 'api'] },
  { key: 'design', names: ['design', 'ui', 'ux', 'figma', 'prototyping', 'wireframe'] },
  { key: 'mobile', names: ['mobile', 'react native', 'ios', 'android', 'flutter', 'kotlin', 'swift'] },
];

function categorizeSkill(raw) {
  const s = (raw || '').toString().toLowerCase().trim();
  if (!s) return null;
  for (const c of SKILL_TO_CATEGORY) {
    if (c.names.some((n) => s.includes(n))) return c.key;
  }
  return null;
}

async function skillDistribution(req, res, next) {
  try {
    // Fetch skills from teamInfo.desiredSkills and fallback to preferences.track
    const regs = await Registration.find({}, { 'teamInfo.desiredSkills': 1, 'preferences.track': 1 }).lean();

    const counts = { frontend: 0, backend: 0, design: 0, mobile: 0 };

    for (const r of regs) {
      const skills = Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills : [];
      let catSet = new Set();
      for (const sk of skills) {
        const cat = categorizeSkill(sk);
        if (cat) catSet.add(cat);
      }
      // fallback: track field
      const trackCat = categorizeSkill(r?.preferences?.track);
      if (trackCat) catSet.add(trackCat);

      if (catSet.size === 0) continue;
      for (const c of catSet) counts[c] += 1;
    }

    const result = [
      { key: 'frontend', name: 'Frontend', count: counts.frontend },
      { key: 'backend', name: 'Backend', count: counts.backend },
      { key: 'design', name: 'Design', count: counts.design },
      { key: 'mobile', name: 'Mobile', count: counts.mobile },
    ];

    res.json({ categories: result });
  } catch (err) {
    next(err);
  }
}

async function teamSuggestions(req, res, next) {
  try {
    const { eventId, eventName, limit = 5 } = req.query;
    const q = {};
    if (eventId) q.event = eventId;
    if (eventName) q.eventName = eventName;

    // Pull needed fields
    const regs = await Registration.find(q, {
      event: 1,
      eventName: 1,
      'personalInfo.firstName': 1,
      'personalInfo.lastName': 1,
      'personalInfo.email': 1,
      'preferences.track': 1,
      'teamInfo.teamName': 1,
      'teamInfo.members': 1,
      'teamInfo.desiredSkills': 1,
      createdAt: 1,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group by teamName per event
    const groups = new Map(); // key: `${eventName}::${teamName}` => array of regs
    for (const r of regs) {
      const teamName = (r?.teamInfo?.teamName || '').trim();
      if (!teamName) continue; // only formed teams
      const ev = r.eventName || (r.event?._id || '').toString() || 'Unknown Event';
      const key = `${ev}::${teamName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    }

    const suggestions = [];
    for (const [key, rs] of groups.entries()) {
      const [evName, teamName] = key.split('::');
      // Build unique members set from teamInfo.members if present; otherwise from personalInfo
      const memberList = [];
      const seen = new Set();
      // Sort registrations by createdAt asc for stable fallback leader selection
      rs.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      for (const r of rs) {
        const members = Array.isArray(r?.teamInfo?.members) ? r.teamInfo.members : [];
        if (members.length > 0) {
          for (const m of members) {
            const email = (m?.email || '').toLowerCase();
            const id = email || `${m.firstName}-${m.lastName}`;
            if (seen.has(id)) continue;
            seen.add(id);
            memberList.push({
              name: [m.firstName, m.lastName].filter(Boolean).join(' ').trim() || email || 'Member',
              role: r?.preferences?.track || 'Member',
              avatar: null,
              skills: Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills.slice(0, 3) : [],
            });
          }
        } else {
          // fallback: the registrant themselves
          const email = (r?.personalInfo?.email || '').toLowerCase();
          const id = email || `${r?.personalInfo?.firstName}-${r?.personalInfo?.lastName}`;
          if (!seen.has(id)) {
            seen.add(id);
            memberList.push({
              name: [r?.personalInfo?.firstName, r?.personalInfo?.lastName].filter(Boolean).join(' ').trim() || email || 'Member',
              role: r?.preferences?.track || 'Member',
              avatar: null,
              skills: Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills.slice(0, 3) : [],
            });
          }
        }
      }

      // Simple compatibility heuristic: diversity of categories in desiredSkills
      const catSet = new Set();
      for (const r of rs) {
        const skills = Array.isArray(r?.teamInfo?.desiredSkills) ? r.teamInfo.desiredSkills : [];
        for (const s of skills) {
          const c = categorizeSkill(s);
          if (c) catSet.add(c);
        }
      }
      const diversity = Math.min(4, catSet.size);
      const sizeFactor = Math.min(5, memberList.length);
      const compatibility = Math.round(80 + diversity * 4 + sizeFactor * 2); // 80..100

      const strengths = [];
      if (diversity >= 3) strengths.push('Balanced skill set');
      if (sizeFactor >= 3) strengths.push('High collaboration score');
      if (diversity >= 2 && sizeFactor >= 2) strengths.push('Complementary experience levels');

      // Determine leader: first member if available; else earliest registrant
      let leaderName = null;
      if (memberList.length > 0) {
        leaderName = memberList[0].name || null;
      } else if (rs.length > 0) {
        const r0 = rs[0];
        leaderName = [r0?.personalInfo?.firstName, r0?.personalInfo?.lastName].filter(Boolean).join(' ').trim() || (r0?.personalInfo?.email || null);
      }

      suggestions.push({
        id: key,
        name: teamName,
        eventName: evName,
        leaderName,
        compatibility: Math.max(0, Math.min(100, compatibility)),
        members: memberList.slice(0, 8),
        strengths: strengths.length ? strengths : ['Strong potential composition'],
        projectFit: `Good fit for ${evName}`,
      });
    }

    // Sort by compatibility and limit
    suggestions.sort((a, b) => b.compatibility - a.compatibility);
    res.json({ suggestions: suggestions.slice(0, Number(limit) || 5) });
  } catch (err) {
    next(err);
  }
}

module.exports = { skillDistribution, teamSuggestions };
