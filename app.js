(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer:fine)').matches;

  // DOM Elements
  var clockEl = document.getElementById('clock');
  var heroNameEl = document.getElementById('heroName');
  var marqueeTrack = document.getElementById('marqueeTrack');
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  var dbBtnText = document.getElementById('db-btn-text');
  var dbStatusText = document.getElementById('db-status-text');

  // Supabase Modal Elements
  var dbModal = document.getElementById('db-modal');
  var openDbModalBtn = document.getElementById('open-db-modal');
  var closeDbModalBtn = document.getElementById('close-db-modal');
  var supaUrlInput = document.getElementById('supa-url-input');
  var supaKeyInput = document.getElementById('supa-key-input');
  var saveDbBtn = document.getElementById('save-db-credentials');
  var resetDbBtn = document.getElementById('reset-db-credentials');

  // Comment Form Elements
  var commentForm = document.getElementById('comment-form');
  var commentNameInput = document.getElementById('comment-name');
  var commentEmailInput = document.getElementById('comment-email');
  var commentMessageInput = document.getElementById('comment-message');
  var commentsFeedEl = document.getElementById('comments-feed');
  var commentsCountEl = document.getElementById('comments-count');

  // Toast Helper
  function showToast(message, isError) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast';
    if (isError) toast.style.borderColor = 'var(--coral)';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity .3s ease';
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3500);
  }

  /* ---------------- LIVE CLOCK ---------------- */
  function tickClock() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = 'LOCAL ' + h + ':' + m + ':' + s;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- KINETIC HERO TYPOGRAPHY ---------------- */
  function renderKineticHeroName(nameText) {
    if (!heroNameEl) return;
    heroNameEl.innerHTML = '';
    var text = nameText || 'Your Name';
    var words = text.split(' ');
    words.forEach(function (word, wi) {
      var wSpan = document.createElement('span');
      wSpan.className = 'word';
      word.split('').forEach(function (ch) {
        var c = document.createElement('span');
        c.className = 'char';
        c.textContent = ch;
        wSpan.appendChild(c);
      });
      heroNameEl.appendChild(wSpan);
      if (wi < words.length - 1) {
        var space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        heroNameEl.appendChild(space);
      }
    });

    if (finePointer && !reduceMotion) {
      var chars = heroNameEl.querySelectorAll('.char');
      window.addEventListener('mousemove', function (e) {
        chars.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = e.clientX - cx, dy = e.clientY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var radius = 140;
          if (dist < radius) {
            var f = (1 - dist / radius);
            c.style.transform = 'translate(' + (-dx * 0.12 * f) + 'px,' + (-dy * 0.12 * f) + 'px)';
            c.style.color = f > 0.5 ? 'var(--lime)' : '';
          } else {
            c.style.transform = '';
            c.style.color = '';
          }
        });
      });
    }
  }

  /* ---------------- MARQUEE TICKER ---------------- */
  function buildMarquee(skillsList) {
    if (!marqueeTrack) return;
    marqueeTrack.innerHTML = '';
    var words = (skillsList && skillsList.length > 0)
      ? skillsList.map(function (s) { return s.name.toUpperCase(); })
      : ["ADD SKILLS IN SUPABASE", "EDIT INDEX.HTML TO CONNECT"];

    for (var rep = 0; rep < 2; rep++) {
      words.forEach(function (w) {
        var item = document.createElement('span');
        item.className = 'marquee-item';
        item.textContent = w;
        marqueeTrack.appendChild(item);
      });
    }
  }

  /* ---------------- DYNAMIC UI RENDERERS ---------------- */

  // 1. Render Profile
  function renderProfile(profile) {
    if (!profile) return;
    renderKineticHeroName(profile.full_name || 'Your Name');

    var navLogoName = document.getElementById('nav-logo-name');
    if (navLogoName) navLogoName.textContent = (profile.full_name || 'YOUR NAME').toUpperCase();

    var heroRole = document.getElementById('heroRole');
    if (heroRole && profile.title) {
      heroRole.innerHTML = profile.title + ' — building <b>intelligent, data-driven systems</b>.';
    }

    var heroLocation = document.getElementById('hero-location');
    if (heroLocation && profile.location) heroLocation.textContent = profile.location;

    var aboutBioText = document.getElementById('about-bio-text');
    if (aboutBioText && profile.bio) aboutBioText.textContent = profile.bio;

    // Contact Links
    var contactEmail = document.getElementById('contact-email');
    if (contactEmail) {
      if (profile.email) {
        contactEmail.textContent = profile.email;
        contactEmail.href = 'mailto:' + profile.email;
        contactEmail.style.display = '';
      } else {
        contactEmail.textContent = 'Add your email in Supabase';
        contactEmail.removeAttribute('href');
      }
    }

    var contactPhone = document.getElementById('contact-phone');
    if (contactPhone) {
      if (profile.phone) {
        contactPhone.href = 'tel:' + profile.phone.replace(/\s+/g, '');
        contactPhone.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z"></path></svg> ' + profile.phone;
        contactPhone.style.display = '';
      } else {
        contactPhone.style.display = 'none';
      }
    }

    var contactLinkedin = document.getElementById('contact-linkedin');
    if (contactLinkedin) {
      if (profile.linkedin_url) contactLinkedin.href = profile.linkedin_url;
      else contactLinkedin.style.display = 'none';
    }

    var contactGithub = document.getElementById('contact-github');
    if (contactGithub) {
      if (profile.github_url) contactGithub.href = profile.github_url;
      else contactGithub.style.display = 'none';
    }
  }

  // 2. Render Education
  function renderEducation(eduList) {
    var eduContainer = document.getElementById('edu-card-container');
    if (!eduList || eduList.length === 0) {
      if (eduContainer) {
        var msg = eduContainer.querySelector('.empty-state-note');
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'empty-state-note';
          msg.style.cssText = 'color:var(--muted-dark);font-size:13px;margin-top:12px;';
          msg.textContent = 'Add a row to the "education" table in Supabase to show it here.';
          eduContainer.appendChild(msg);
        }
      }
      return;
    }
    var edu = eduList[0];
    var eduDegree = document.getElementById('edu-degree');
    var eduSchool = document.getElementById('edu-school');
    var eduCgpa = document.getElementById('edu-cgpa');
    var eduCoursework = document.getElementById('edu-coursework');

    if (eduDegree) eduDegree.textContent = edu.degree;
    if (eduSchool) {
      var yearRange = edu.end_date ? ' · Expected ' + new Date(edu.end_date).getFullYear() : '';
      eduSchool.textContent = edu.institution + (edu.field ? ' (' + edu.field + ')' : '') + yearRange;
    }
    if (eduCgpa) {
      if (edu.cgpa) {
        eduCgpa.textContent = 'CGPA: ' + parseFloat(edu.cgpa).toFixed(2);
        eduCgpa.style.display = 'inline-block';
      } else {
        eduCgpa.style.display = 'none';
      }
    }
    if (eduCoursework && edu.coursework && edu.coursework.length > 0) {
      eduCoursework.innerHTML = '';
      edu.coursework.forEach(function (c) {
        var span = document.createElement('span');
        span.textContent = c;
        eduCoursework.appendChild(span);
      });
    }
  }

  // 3. Render Skills
  function renderSkills(skillsList) {
    var container = document.getElementById('skills-clusters');
    if (!container || !skillsList) return;
    container.innerHTML = '';

    if (skillsList.length === 0) {
      container.innerHTML = '<p style="color:var(--muted-dark);font-size:14px;">No skills yet — add rows to the "skills" table in Supabase.</p>';
      return;
    }

    // Group skills by category
    var categories = {};
    skillsList.forEach(function (s) {
      var cat = s.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    });

    var categoryColors = {
      'Languages': '#2F52FF',
      'Frameworks': '#8A5CFF',
      'Databases': '#FF5A36',
      'AI / ML': '#8A5CFF',
      'Tools': '#12B886'
    };

    Object.keys(categories).forEach(function (catName, idx) {
      var catSkills = categories[catName];
      var color = categoryColors[catName] || '#2F52FF';

      var clusterDiv = document.createElement('div');
      clusterDiv.className = 'cluster reveal' + (idx % 2 === 1 ? ' reveal-delay-1' : '');
      clusterDiv.style.setProperty('--cluster-color', color);

      var topDiv = document.createElement('div');
      topDiv.className = 'cluster-top';
      topDiv.innerHTML = '<h4>' + catName + '</h4><span class="cluster-code">' + catName.substring(0, 4).toUpperCase() + '</span>';

      var nodeList = document.createElement('div');
      nodeList.className = 'node-list';

      catSkills.forEach(function (sk) {
        var item = document.createElement('div');
        item.className = 'node-item';
        item.innerHTML =
          '<div class="node-header"><span>' + sk.name + '</span><span>' + sk.proficiency + '%</span></div>' +
          '<div class="node-bar-track"><div class="node-bar-fill" style="width: ' + sk.proficiency + '%;"></div></div>';
        nodeList.appendChild(item);
      });

      clusterDiv.appendChild(topDiv);
      clusterDiv.appendChild(nodeList);
      container.appendChild(clusterDiv);
    });

    observeReveals();
  }

  // 4. Render Projects
  function renderProjects(projectsList) {
    var container = document.getElementById('projects-grid');
    if (!container || !projectsList) return;
    container.innerHTML = '';

    if (projectsList.length === 0) {
      container.innerHTML = '<p style="color:var(--muted-dark);font-size:14px;">No projects yet — add rows to the "projects" table in Supabase.</p>';
      return;
    }

    projectsList.forEach(function (p, idx) {
      var card = document.createElement('div');
      card.className = 'tilt-card reveal' + (idx % 2 === 1 ? ' reveal-delay-1' : '');
      card.setAttribute('data-tilt', '');

      var stackText = (p.tech_stack && p.tech_stack.length > 0) ? p.tech_stack.join(' · ') : '';
      var statusBadge = p.status ? '<span class="proj-status">' + p.status + '</span>' : '';

      card.innerHTML =
        '<div class="tilt-inner" style="--pgrad: linear-gradient(135deg, rgba(47,82,255,0.22), transparent 60%);">' +
        '  <div>' +
        '    <div class="proj-index"><span>' + (p.category || 'Project') + '</span>' + statusBadge + '</div>' +
        '    <h3>' + p.title + '</h3>' +
        '    <div class="stack">' + stackText + '</div>' +
        '    <p>' + p.description + '</p>' +
        '  </div>' +
        '</div>';

      container.appendChild(card);
    });

    observeReveals();
    initTiltCards();
  }

  // 5. Render Certifications
  function renderCertifications(certsList) {
    var container = document.getElementById('certifications-grid');
    if (!container || !certsList) return;
    container.innerHTML = '';

    if (certsList.length === 0) {
      container.innerHTML = '<p style="color:var(--muted-dark);font-size:14px;">No certifications yet — add rows to the "certifications" table in Supabase.</p>';
      return;
    }

    certsList.forEach(function (c) {
      var card = document.createElement('div');
      card.className = 'cert-card reveal';
      
      var formattedDate = c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

      card.innerHTML =
        '<div class="cert-issuer">' + (c.issuer || 'Certification') + '</div>' +
        '<h4>' + c.name + '</h4>' +
        (formattedDate ? '<div class="cert-date">Acquired: ' + formattedDate + '</div>' : '');

      container.appendChild(card);
    });

    observeReveals();
  }

  // 6. Render Achievements
  function renderAchievements(achievementsList) {
    var container = document.getElementById('achievements-grid');
    if (!container || !achievementsList) return;
    container.innerHTML = '';

    if (achievementsList.length === 0) {
      container.innerHTML = '<p style="color:var(--muted-dark);font-size:14px;">No achievements yet — add rows to the "achievements" table in Supabase.</p>';
      return;
    }

    achievementsList.forEach(function (a, idx) {
      var row = document.createElement('div');
      row.className = 'log-row reveal' + (idx % 2 === 1 ? ' reveal-delay-1' : '');

      var dateStr = a.achieved_date ? new Date(a.achieved_date).getFullYear() : 'Milestone';

      row.innerHTML =
        '<span class="tag">' + dateStr + '</span>' +
        '<h4>' + a.title + '</h4>' +
        '<p>' + a.description + '</p>';

      container.appendChild(row);
    });

    observeReveals();
  }

  // 7. Render Comments
  function renderComments(commentsList) {
    if (!commentsFeedEl || !commentsCountEl) return;
    commentsFeedEl.innerHTML = '';
    var list = commentsList || [];
    commentsCountEl.textContent = list.length;

    if (list.length === 0) {
      commentsFeedEl.innerHTML = '<div class="comment-card"><p class="comment-text" style="color:var(--muted-dark);">No comments yet. Be the first to leave a message!</p></div>';
      return;
    }

    list.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'comment-card';

      var dateObj = new Date(item.created_at || Date.now());
      var timeAgo = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      card.innerHTML =
        '<div class="comment-meta">' +
        '  <span class="comment-author">' + escapeHtml(item.name) + '</span>' +
        '  <span class="comment-time">' + timeAgo + '</span>' +
        '</div>' +
        '<p class="comment-text">' + escapeHtml(item.message) + '</p>';

      commentsFeedEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------------- OBSERVE REVEALS ---------------- */
  function observeReveals() {
    var revealEls = document.querySelectorAll('.reveal:not(.in-view)');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }
  }

  /* ---------------- FETCH & RE-RENDER EVERYTHING ---------------- */
  async function loadPortfolioContent() {
    dbStatusText.textContent = 'CONNECTING SUPABASE...';

    const result = await window.PortfolioSupabase.fetchAll();
    const data = result.data;

    if (result.isConnected) {
      dbStatusText.textContent = 'SUPABASE CONNECTED';
      dbBtnText.textContent = 'SUPABASE LIVE';
    } else {
      dbStatusText.textContent = 'TEMPLATE MODE — NOT CONNECTED';
      dbBtnText.textContent = 'CONNECT SUPABASE';
    }

    renderProfile(data.profile);
    renderEducation(data.education);
    renderSkills(data.skills);
    renderProjects(data.projects);
    renderCertifications(data.certifications);
    renderAchievements(data.achievements);
    renderComments(data.comments);

    buildMarquee(data.skills);
  }

  /* ---------------- COMMENT SUBMISSION HANDLER ---------------- */
  if (commentForm) {
    commentForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = commentNameInput.value.trim();
      var email = commentEmailInput.value.trim();
      var message = commentMessageInput.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all fields.', true);
        return;
      }

      var submitBtn = document.getElementById('comment-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      var res = await window.PortfolioSupabase.submitComment(name, email, message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post Comment';

      if (res.success) {
        commentMessageInput.value = '';
        showToast(res.isLocal ? 'Message saved locally (Demo Mode)!' : 'Message saved to Supabase successfully!');
        // Refresh comments list
        var refreshed = await window.PortfolioSupabase.fetchAll();
        renderComments(refreshed.data.comments);
      } else {
        showToast('Submission error: ' + res.error, true);
      }
    });
  }

  /* ---------------- SUPABASE DATABASE MODAL HANDLERS ---------------- */
  if (openDbModalBtn && dbModal) {
    openDbModalBtn.addEventListener('click', function () {
      var creds = window.PortfolioSupabase.getCredentials();
      supaUrlInput.value = creds.url;
      supaKeyInput.value = creds.key;
      dbModal.classList.add('active');
    });
  }

  if (closeDbModalBtn && dbModal) {
    closeDbModalBtn.addEventListener('click', function () {
      dbModal.classList.remove('active');
    });
  }

  if (saveDbBtn) {
    saveDbBtn.addEventListener('click', function () {
      var url = supaUrlInput.value.trim();
      var key = supaKeyInput.value.trim();
      window.PortfolioSupabase.saveCredentials(url, key);
      dbModal.classList.remove('active');
      showToast('Database settings saved! Reloading data...');
      loadPortfolioContent();
    });
  }

  if (resetDbBtn) {
    resetDbBtn.addEventListener('click', function () {
      window.PortfolioSupabase.saveCredentials('', '');
      supaUrlInput.value = '';
      supaKeyInput.value = '';
      dbModal.classList.remove('active');
      showToast('Reset to Resume Fallback Mode.');
      loadPortfolioContent();
    });
  }

  /* ---------------- NAVIGATION THEME AWARENESS ---------------- */
  var darkSections = Array.prototype.slice.call(document.querySelectorAll('section.dark'));
  function updateNavTheme() {
    var y = window.scrollY + 40;
    var onDark = darkSections.some(function (s) {
      var top = s.offsetTop, bottom = top + s.offsetHeight;
      return y >= top && y < bottom;
    });
    if (nav) {
      nav.classList.toggle('on-dark', onDark);
      nav.classList.toggle('on-light', !onDark);
      nav.classList.toggle('scrolled', window.scrollY > 30);
    }
  }
  window.addEventListener('scroll', updateNavTheme);
  updateNavTheme();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () { navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { navLinks.classList.remove('open'); }); });
  }

  /* ---------------- CUSTOM CURSOR ---------------- */
  if (finePointer) {
    document.documentElement.classList.add('has-cursor');
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    var label = document.getElementById('cursor-label');
    var mx = 0, my = 0, rx = 0, ry = 0;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });

    function ringLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('a, button, .tilt-card, .chip, .node-item, .cert-card');
      if (target) {
        var isDarkCtx = target.closest('.dark') !== null;
        document.body.classList.toggle('cur-invert', !isDarkCtx);
        var cd = target.getAttribute('data-cursor');
        if (cd) {
          document.body.classList.add('cur-grow');
          if (label) label.textContent = cd;
        }
      }
    });

    document.addEventListener('mouseout', function (e) {
      var target = e.target.closest('a, button, .tilt-card, .chip, .node-item, .cert-card');
      if (target) {
        document.body.classList.remove('cur-invert', 'cur-grow');
        if (label) label.textContent = '';
      }
    });

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach(function (wrapEl) {
      var target = wrapEl.querySelector('a') || wrapEl;
      wrapEl.addEventListener('mousemove', function (e) {
        var r = wrapEl.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        target.style.transform = 'translate(' + (relX * 0.28) + 'px,' + (relY * 0.35) + 'px)';
      });
      wrapEl.addEventListener('mouseleave', function () {
        target.style.transform = 'translate(0,0)';
        target.style.transition = 'transform .35s cubic-bezier(.16,.8,.24,1)';
        setTimeout(function () { target.style.transition = ''; }, 350);
      });
    });
  }

  /* ---------------- 3D TILT CARDS ---------------- */
  function initTiltCards() {
    if (!finePointer) return;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var inner = card.querySelector('.tilt-inner');
      if (!inner) return;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = 'rotateY(' + (px * 10) + 'deg) rotateX(' + (-py * 10) + 'deg) translateZ(0)';
      });
      card.addEventListener('mouseleave', function () {
        inner.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }

  /* ---------------- NEURAL CANVAS FIELD ---------------- */
  function buildNeuralField(canvas, opts) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var section = canvas.parentElement;
    var W, H, nodes = [];
    var mouseX = -9999, mouseY = -9999;
    var spacing = opts.spacing || 64;

    function resize() {
      W = canvas.width = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
      nodes = [];
      var cols = Math.ceil(W / spacing) + 1;
      var rows = Math.ceil(H / spacing) + 1;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          nodes.push({
            x: i * spacing + (Math.sin(j * 13.1) * 10),
            y: j * spacing + (Math.cos(i * 7.3) * 10),
            baseR: Math.random() * 1.2 + 0.6,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }
    resize();
    window.addEventListener('resize', resize);

    section.addEventListener('mousemove', function (e) {
      var r = section.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });
    section.addEventListener('mouseleave', function () { mouseX = -9999; mouseY = -9999; });

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var activeRadius = opts.radius || 220;

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = mouseX - n.x, dy = mouseY - n.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var proximity = Math.max(0, 1 - dist / activeRadius);
        var pulse = reduceMotion ? 0 : Math.sin(t * 0.02 + n.phase) * 0.3 + 0.3;
        var alpha = opts.baseAlpha + proximity * 0.9 + pulse * 0.08;
        var rad = n.baseR + proximity * 2.2;

        if (proximity > 0.02) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(214,255,78,' + (proximity * 0.55) + ')';
          ctx.lineWidth = 1;
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + opts.dotRGB + ',' + Math.min(1, alpha) + ')';
        ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      t += 1;
      if (!reduceMotion) { requestAnimationFrame(draw); }
    }
    draw();
  }

  buildNeuralField(document.getElementById('hero-canvas'), { spacing: 56, baseAlpha: 0.12, dotRGB: '150,160,170', radius: 240 });
  buildNeuralField(document.getElementById('contact-canvas'), { spacing: 60, baseAlpha: 0.1, dotRGB: '150,160,170', radius: 220 });

  // INITIAL LOAD
  loadPortfolioContent();

})();
