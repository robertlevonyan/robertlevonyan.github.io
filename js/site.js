(function () {
    'use strict';

    var doc = document.documentElement;
    doc.classList.add('js');

    // Hero line reveal
    function onReady() {
        requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });
    }
    if (document.fonts && document.fonts.ready) {
        Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 800); })]).then(onReady);
    } else {
        window.addEventListener('load', onReady);
    }

    // Theme toggle (dark is the default; choice is remembered)
    var themeBtn = document.querySelector('.theme-toggle');
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    function applyTheme(t) {
        doc.setAttribute('data-theme', t);
        if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0e0e0f' : '#f2f2f2');
        if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    applyTheme(doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // Year
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Mobile menu
    var toggle = document.querySelector('.nav-menu-button');
    if (toggle) {
        toggle.addEventListener('click', function () {
            var open = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
        document.querySelectorAll('.nav-menu a').forEach(function (a) {
            a.addEventListener('click', function () {
                document.body.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Scroll reveal
    var revealEls = document.querySelectorAll('.fade-up');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-in');
                    io.unobserve(e.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    // Fixed CTA: show after the hero, hide over the footer
    var cta = document.querySelector('.fixed-cta');
    var hero = document.querySelector('.section-hero');
    var footer = document.querySelector('.section-footer');
    function updateCta() {
        if (!cta || !hero || !footer) return;
        var pastHero = hero.getBoundingClientRect().bottom < window.innerHeight * 0.4;
        var atFooter = footer.getBoundingClientRect().top < window.innerHeight * 0.85;
        cta.classList.toggle('is-visible', pastHero && !atFooter);
    }

    // Active nav link
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-menu-links a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function updateActive() {
        var mid = window.innerHeight * 0.35;
        var current = -1;
        sections.forEach(function (s, i) {
            if (s && s.getBoundingClientRect().top <= mid) current = i;
        });
        links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () { updateCta(); updateActive(); ticking = false; });
    }, { passive: true });
    updateCta();
    updateActive();

    // Cursor-following preview on secondary list
    var preview = document.querySelector('.hover-preview');
    var previewImg = preview && preview.querySelector('img');
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (preview && finePointer) {
        var x = 0, y = 0, cx = 0, cy = 0, raf = null;
        function loop() {
            cx += (x - cx) * 0.18;
            cy += (y - cy) * 0.18;
            preview.style.left = cx + 'px';
            preview.style.top = cy + 'px';
            raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
        }
        document.querySelectorAll('.secondary-project-card[data-preview]').forEach(function (card) {
            card.addEventListener('mouseenter', function (e) {
                previewImg.src = card.getAttribute('data-preview');
                x = cx = e.clientX; y = cy = e.clientY;
                preview.style.left = cx + 'px';
                preview.style.top = cy + 'px';
                preview.classList.add('is-visible');
            });
            card.addEventListener('mousemove', function (e) {
                x = e.clientX; y = e.clientY;
                if (!raf) raf = requestAnimationFrame(loop);
            });
            card.addEventListener('mouseleave', function () {
                preview.classList.remove('is-visible');
            });
        });
    }
})();
