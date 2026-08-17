/**
 * SUPABASE CONFIGURATION & DATA ENGINE
 * Reusable Portfolio Template — configure via window.SUPABASE_CONFIG in index.html
 */

(function (window) {
  'use strict';

  // Local storage KEY NAMES — used only if someone connects live via the
  // "CONNECT SUPABASE" modal instead of editing index.html directly.
  const STORAGE_URL_KEY = 'portfolio_supabase_url';
  const STORAGE_ANON_KEY = 'portfolio_supabase_anon_key';

  // Empty Template Data — shown whenever no Supabase URL/anon key is
  // configured (in index.html's window.SUPABASE_CONFIG, or via the modal).
  // This intentionally contains NO personal data, so the site works as a
  // clean, reusable template out of the box.
  const FALLBACK_DATA = {
    profile: {
      full_name: 'Your Name',
      title: 'Add your title in the Supabase "profile" table',
      bio: 'Connect your Supabase project (paste your URL and anon key into window.SUPABASE_CONFIG in index.html) and add a row to the "profile" table to see your bio here.',
      email: '',
      phone: '',
      location: '',
      avatar_url: null,
      resume_pdf_url: null,
      github_url: '',
      linkedin_url: '',
      twitter_url: null,
      website_url: null
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    comments: []
  };

  let supabaseClient = null;

  function getStoredCredentials() {
    var pageConfig = window.SUPABASE_CONFIG || {};
    return {
      // localStorage (set via the "CONNECT SUPABASE" modal) overrides
      // index.html if present; otherwise fall back to whatever is written
      // directly into window.SUPABASE_CONFIG in index.html.
      url: localStorage.getItem(STORAGE_URL_KEY) || pageConfig.url || '',
      key: localStorage.getItem(STORAGE_ANON_KEY) || pageConfig.anonKey || ''
    };
  }

  function saveCredentials(url, key) {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (key) localStorage.setItem(STORAGE_ANON_KEY, key.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);

    initSupabaseClient();
  }

  function initSupabaseClient() {
    const { url, key } = getStoredCredentials();
    if (url && key && window.supabase) {
      try {
        supabaseClient = window.supabase.createClient(url, key);
        return true;
      } catch (err) {
        console.error('Error initializing Supabase client:', err);
        supabaseClient = null;
        return false;
      }
    }
    supabaseClient = null;
    return false;
  }

  async function fetchTableData(table, selectQuery = '*', orderBy = 'sort_order') {
    if (!supabaseClient) return null;
    try {
      let query = supabaseClient.from(table).select(selectQuery);
      if (orderBy) {
        query = query.order(orderBy, { ascending: true });
      }
      const { data, error } = await query;
      if (error) {
        console.warn(`Supabase fetch failed for table '${table}':`, error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn(`Supabase network exception for table '${table}':`, err);
      return null;
    }
  }

  async function fetchAllPortfolioData() {
    initSupabaseClient();

    const isConnected = !!supabaseClient;
    if (!isConnected) {
      return { isConnected: false, data: FALLBACK_DATA };
    }

    try {
      const [
        profileRes,
        educationRes,
        experienceRes,
        skillsRes,
        projectsRes,
        certificationsRes,
        achievementsRes,
        commentsRes
      ] = await Promise.all([
        fetchTableData('profile', '*', null),
        fetchTableData('education', '*'),
        fetchTableData('experience', '*'),
        fetchTableData('skills', '*'),
        fetchTableData('projects', '*'),
        fetchTableData('certifications', '*'),
        fetchTableData('achievements', '*'),
        fetchTableData('contact_messages', '*', 'created_at')
      ]);

      const profile = (profileRes && profileRes.length > 0) ? profileRes[0] : FALLBACK_DATA.profile;
      const education = (educationRes && educationRes.length > 0) ? educationRes : FALLBACK_DATA.education;
      const experience = experienceRes !== null ? experienceRes : FALLBACK_DATA.experience;
      const skills = (skillsRes && skillsRes.length > 0) ? skillsRes : FALLBACK_DATA.skills;
      const projects = (projectsRes && projectsRes.length > 0) ? projectsRes : FALLBACK_DATA.projects;
      const certifications = (certificationsRes && certificationsRes.length > 0) ? certificationsRes : FALLBACK_DATA.certifications;
      const achievements = (achievementsRes && achievementsRes.length > 0) ? achievementsRes : FALLBACK_DATA.achievements;
      const comments = commentsRes !== null ? commentsRes.reverse() : FALLBACK_DATA.comments;

      return {
        isConnected: true,
        data: {
          profile,
          education,
          experience,
          skills,
          projects,
          certifications,
          achievements,
          comments
        }
      };
    } catch (err) {
      console.error('Error in fetchAllPortfolioData:', err);
      return { isConnected: false, data: FALLBACK_DATA };
    }
  }

  async function submitVisitorMessage(name, email, message) {
    if (!supabaseClient) {
      const newComment = {
        id: 'local-' + Date.now(),
        name: name,
        email: email,
        message: message,
        created_at: new Date().toISOString()
      };
      FALLBACK_DATA.comments.unshift(newComment);
      return { success: true, isLocal: true, data: newComment };
    }

    try {
      const { data, error } = await supabaseClient
        .from('contact_messages')
        .insert([{ name, email, message }])
        .select();

      if (error) {
        throw error;
      }
      return { success: true, isLocal: false, data: data ? data[0] : null };
    } catch (err) {
      console.error('Error submitting comment to Supabase:', err);
      return { success: false, error: err.message || 'Submission failed' };
    }
  }

  window.PortfolioSupabase = {
    getCredentials: getStoredCredentials,
    saveCredentials,
    init: initSupabaseClient,
    fetchAll: fetchAllPortfolioData,
    submitComment: submitVisitorMessage,
    fallback: FALLBACK_DATA
  };

})(window);
