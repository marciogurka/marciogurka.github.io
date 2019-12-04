/* global jQuery, Tiles, google */

let appInitialized;

(function ($) {


  $(document).ready(() => {
    particlesJS.load('particles-js', './particlesjs-config.json', (data) => {
		});
  });


  // Module name: Tiles
  // Dependencies: jquery.hoverIntent.js, velocity.js, velocity.ui.js
  // Docs:
  // https://github.com/briancherne/jquery-hoverIntent
  // https://github.com/julianshapiro/velocity
  window.Tiles = (function () {
    const pub = {}; // Public methods
    let s = { // Selectors
      img: $('.js-main-image'),
      tiles: $('.js-tile'),
      mainPage: $('#main-page'),
      app: $('.js-app'),
      sections: $('.js-section'),
    };

    pub.init = function () {
      setMainImage();

      s.mainPage.addClass('active');
      pub.showTiles();
      bindMainHover();
      bindAnimation();

      Sections.init();
      Sections.bindResize();
    };

    // Private methods
    // Bind tiles behavior on mouseenter and mouseleave
    function bindMainHover() {
      s.mainPage.hoverIntent({
        over() {
          pub.mend();
        },
        out() {
          pub.explode();
        },
        timeout: 250,
      });
    }

    // Set the background image of the tiles
    function setMainImage() {
      const url = $('.js-main-image').eq(0).attr('src');

      if (url) {
        s.tiles.css('background-image', `url(${url})`);
      }
    }

    // Animation events
    function bindAnimation() {
      s.app.on('animation.finished', () => {
        s.app.removeClass('animating');
      });
    }

    // Unbind the Hover events when the main page is closed
    function unbindMainHover() {
      s.mainPage.unbind('mouseenter.hoverIntent mouseleave.hoverIntent');
    }

    // Check if main page is open
    function isMainPageActive() {
      return !!s.mainPage.hasClass('active');
    }

    // Explode the page after 500ms
    function explodeOnTimeOut() {
      setTimeout(() => {
        s.tiles.addClass('explode');

        if (s.mainPage.is(':hover')) {
          pub.mend();
        }
      }, 500);
    }

    // Shuffle the order the tiles will be flip
    function shuffle(o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    }

    // Flip the tiles forward or backward
    function flip(direction, callback) {
      const shuffledTiles = shuffle(s.tiles);

      if (direction === 'forward') {
        shuffledTiles.each(function (i) {
          const tile = $(this);
          setTimeout(() => {
            s.app.addClass('animating');
            tile.addClass('rotate-forward');
            if (i === shuffledTiles.length - 1) {
              setTimeout(() => {
								callback();
							}, 800);
            }
          }, 50 * i);
        });
      } else {
        shuffledTiles.each(function (i) {
          const tile = $(this);
          setTimeout(() => {
            tile.removeClass('rotate-forward');
            if (i === shuffledTiles.length - 1) {
              setTimeout(() => {
								s.app.trigger('animation.finished');
							}, 800);
            }
          }, 50 * i);
        });
      }
    }

    // Animate the elements on the page once the page is open
    function showPage(target, secondary) {
      target.addClass('active');

      const delay = 150;

      // Animate Content
      $('.active.section .js-animated-content').velocity('transition.slideDownIn', {
        stagger: delay,
      });

      $('.active.section .js-animated-video').velocity('transition.fadeIn');


      // Animate navigation
      if (secondary !== true) {
        $('.js-section-nav').css('visibility', 'visible');
        $('.js-section-nav .section-nav-elem').velocity('transition.slideLeftIn', {
          stagger: delay,
        });
      }

      // Animate scroll-bar
      setTimeout(() => {
        $('.active.section .js-scroll-bar').velocity({
          translateX: '40px',
          opacity: 1,
        }, {
          easing: 'easeOutExpo',
          duration: 750,
          complete () {
						s.app.trigger('animation.finished');
					},
        });
      }, delay * 3);

    }

    // Animate the elements backward once the page is closed
    function hidePage(callback, secondary) {
      let selectors = '.active.section .js-animated-content, .active.section .js-animated-video, .active.section .js-scroll-bar';

      s.app.addClass('animating');

      Video.pauseAll();

      if (secondary !== true) { selectors += ', .js-section-nav .section-nav-elem'; }

      $(selectors).velocity('reverse', {
        complete() {
          if (secondary !== true) { $('.js-section-nav').css('visibility', 'hidden'); }

          $('.js-section.active').removeClass('active');
          callback();
        },
        duration: 250,
      });

    }

    // Public methods
    // Bind the internal links
    pub.bindGoToTiles = function () {
      $('.js-goto').unbind().click(function (e) {
        e.preventDefault();
			    pub.open($(this).data('target'));
      });
    };

    pub.bindGoToScroll = function () {
      $('.js-goto').unbind().click(function (e) {
        e.preventDefault();
			    $('html, body').animate({ scrollTop: `${$($(this).data('target')).offset().top }px` });
      });
    };

    // Open the page with the given ID
    pub.open = function (target) {
        	const $target = $(target);

        	if ($target.length && !s.app.hasClass('animating') && !$target.hasClass('active')) {

        		if ($target.attr('id') === 'main-page') { // Target: main page
        			hidePage(() => {
        				flip('backward');
        				s.mainPage.addClass('active');
        				bindMainHover();
        				explodeOnTimeOut();
        			});
        		} else if (isMainPageActive()) { // Source: main page; Target: secondary page
        			s.mainPage.removeClass('active');
        			pub.mend();
        			unbindMainHover();
        			flip('forward', () => {
	        			showPage($(target));
        			});
        		} else { // Source: secondary page; Target: secondary page
        			hidePage(() => {
	        			showPage($(target), true);
        			}, true);
        		}
        	}

        	Menu.close();

    };


    // Open next page
    pub.openNext = function () {
        	const { length } = s.sections;
        	const current = s.sections.filter('.active').index() - 1;
        	const next = current + 1;

        	if (s.sections.filter('.active').length) {
	        	pub.open(`#${s.sections.eq((next >= length) ? 0 : next).attr('id')}`);
        	} else {
        		pub.open(`#${s.sections.eq(0).attr('id')}`);
        	}
    };

    // Open previous page
    pub.openPrev = function () {
        	const { length } = s.sections;
        	const current = s.sections.filter('.active').index() - 1;
        	const last = length - 1;
        	const prev = current - 1;

        	if (s.sections.filter('.active').length) {
	        	pub.open(`#${s.sections.eq((prev < 0) ? last : prev).attr('id')}`);
        	} else {
        		pub.open(`#${s.sections.eq(0).attr('id')}`);
        	}
    };

    // Re-initialize the scroll
    pub.reinitScroll = function (section) {
      if ($(section).length) {
        $(section).find('.js-scroll-area').sly('reload');
      }
    };

    // Mend the main page
    pub.mend = function () {
      s.tiles.removeClass('explode');
    };

    // Explode the main page
    pub.explode = function () {
      s.tiles.addClass('explode');
    };

    // Fade the tiles on page load
    pub.showTiles = function () {

      s.tiles.addClass('loaded');

      $('.js-menu-trigger').addClass('loaded');

      explodeOnTimeOut();

    };

    return pub;

  }());

  // Module name: Sections
  // Dependencies: jquery.sly.js
  // Docs: https://github.com/darsain/sly
  var Sections = (function () {
    const breakpoint = 1200;
    let s = {
      sections: $('.js-section:not(.video-section)'),
    };

    // Initialize the navigation arrows
    const initNavigation = function () {
      const next = $('.js-next');
      let prev = $('.js-prev');

      next.click((e) => {
        e.preventDefault();
        Tiles.openNext();
      });

      prev.click((e) => {
        e.preventDefault();
        Tiles.openPrev();
      });
    };

    // Bind keyboard navigation
    const initKeyNavigation = function () {
      $('body').keydown((e) => {
        if ($(window).outerWidth() > 1200) {
          if (e.keyCode == 37) { // left
            Tiles.openPrev();
          } else if (e.keyCode == 38) { // top
            Tiles.open('#main-page');
          } else if (e.keyCode == 39) { // right
            Tiles.openNext();
          }
        }
      });
    };

    // Bind internal page custom scroll
    const initScroll = function () {
      const sections = s.sections.find('.js-scroll-area');

      sections.each(function () {
        const section = $(this);
        const scroll = section.parent().find('.js-scroll-bar');

        section.sly({
          speed: 300,
          easing: 'easeOutExpo',
          scrollBar: scroll,
          dragHandle: 1,
          scrollBy: 120,
          mouseDragging: 0,
          interactive: '#google-map div, #google-map img',
          touchDragging: 1,
          releaseSwing: 1,
          dynamicHandle: 1,
          clickBar: 1,
          elasticBounds: 0,
        });

      });
    };

    return {

      // Initialize all the sections
      init() {
        let windowW = $(window).outerWidth();

        $('window').scrollTop(0);

        if (breakpoint < windowW) {
          initScroll();
          initNavigation();
          initKeyNavigation();
          Tiles.bindGoToTiles();


          appInitialized = true;

        }else {
			  		Tiles.bindGoToScroll();

          appInitialized = false;
        }
      },

      // Destroy all the sections
      destroy() {
        let sections = s.sections.find('.js-scroll-area');

        sections.each(function () {
          let section = $(this);

          section.sly(false);
        });
      },

      // Destroy the app if the window is smaller than the breakpoint
      // Reinitialize the app if the window is bigger than the breakpoint
      bindResize() {

        let resizeTimer;

        $(window).on('resize', () => {
				  clearTimeout(resizeTimer);
				  resizeTimer = setTimeout(function() {

				  	var windowW = $(window).outerWidth();

				  	if(breakpoint < windowW && !appInitialized){
				  		Sections.init();
						Tiles.bindGoToTiles();
				  		appInitialized = true;
				  	}else if(breakpoint > windowW && appInitialized){
				  		Sections.destroy();
				  		Tiles.bindGoToScroll();
				  		appInitialized = false;
				  	}

				  	if(typeof $('.js-scroll-area').sly === 'function'){
					  	$('.js-scroll-area').sly('reload');
				  	}


				  }, 250);
				});
      },
    };
  }());

  // Name: Skills
  // Dependencies: no dependencies
  (function () {
    $('.js-skill-item').each(function () {
      const skill = $(this);
      let bar = skill.find('.js-skill-progress');
      let progress = skill.data('progress');

      bar.css('width', `${progress }%`);

    });
  }());

  // Name: Experience Slider
  // Dependencies: owl.carousel.js, jquery.equalHeight.js
  // Docs:
  // https://github.com/smashingboxes/OwlCarousel2
  // https://github.com/Sam152/Javascript-Equal-Height-Responsive-Rows
  const ExperienceSlider = (function () {
    return {
      init() {
        let slider = $('.js-experience-slider');
					var items = slider.find('.experience-list-item');

        slider.owlCarousel({
				    loop: true,
				    margin: 30,
				    nav: true,
				    navText: [
				    	'<span class="js-prev-experience experience-nav exp-prev"><i class="fas fa-long-arrow-alt-left"></i></span>',
				    	'<span class="js-next-experience experience-nav exp-next"><i class="fas fa-long-arrow-alt-right"></i></span>',
				    ],
				    responsive: {
				        0: {
				            items: 1,
				        },
				        700: {
				            items: 2,
				        },
				        1200: {
				            items: 2,
				        },
				        1400: {
				        	items: 3,
				        },
				    },
        });

        items.responsiveEqualHeightGrid();
      },
    };
  }());

  // Name: Portfolio
  // Dependencies: lightbox.js
  // Docs: https://github.com/lokesh/lightbox2/
  const Portfolio = (function () {
    return {
      initSquarePreviews() {
        let previews = $('.js-portfolio-preview');

        previews.each(function () {
          let preview = $(this);
						var w = preview.outerWidth();
						var h = preview.outerHeight();

          if (w > h) {
            preview.addClass('preview-larger');
          }else {
            preview.addClass('preview-higher');
          }

        });
      },

      init() {
        this.initSquarePreviews();
      },
    };
  }());

  // Name: Accordion
  // Dependencies: no dependencies
  const Accordion = (function () {
    return {
      init() {
        let accordions = $('.js-accordion');

        accordions.each(function () {
          let accordion = $(this);
          let title = accordion.find('.accordion-title');

          title.click(function (event) {
            event.preventDefault();

            let title = $(this);
            let scope = title.closest('.accordion-item');
            let content = $('.accordion-content', scope);

            if (content.hasClass('active')) {
              title.removeClass('active');
              content.stop().slideUp(() => {
								Tiles.reinitScroll('#' + accordion.closest('.js-section').attr('id'));
							}).removeClass('active');
            }else {
              title.addClass('active');
              content.stop().slideDown(() => {
								Tiles.reinitScroll('#' + accordion.closest('.js-section').attr('id'));
							}).addClass('active');
            }
          });
        });
      },
    };
  }());

  // Name: Menu
  // Dependencies: no dependencies
  var Menu = (function () {
    const menu = $('.js-menu');
    let trigger = menu.find('.js-menu-trigger');
    let cover = menu.find('.js-cover');

    return {
      init() {

        let self = this;

        trigger.click((e) => {
					e.stopPropagation();
					self.open();
				});

        cover.click((e) => {
					e.stopPropagation();
					self.close();
				});
      },

      open() {
        menu.addClass('active');
      },

      close() {
        menu.removeClass('active');
      },
    };
  }());


  // Name: Circle Progress
  // Dependencies: jquery.circle-progress.js
  // Docs: https://github.com/kottenator/jquery-circle-progress
  const CircleProgress = (function () {
    const circles = $('.js-circle');

    return {
      init() {
        circles.each(function () {
          let circle = $(this);
						var value = circle.data('value');

          if (value) {
            circle.circleProgress({
              value,
              size: 125,
              thickness: 6,
              lineCap: 'round',
              startAngle: -Math.PI / 2,
              fill: {
                color: '#bec0cb',
              },
            });
          }
        });
      },
    };
  }());

  // Name: Testimonials
  // Dependencies: jquery.equalHeight.js
  // Docs: https://github.com/Sam152/Javascript-Equal-Height-Responsive-Rows
  const Testimonials = (function () {
    const testims = $('.js-testimonial');

    return {
      init() {
        testims.responsiveEqualHeightGrid();
      },
    };
  }());

  // Name: Video
  // Dependencies: jquery.fitvids.js, jquery.vimeo.api.js
  // Docs:
  // https://github.com/davatron5000/FitVids.js
  // https://github.com/jrue/Vimeo-jQuery-API
  var Video = (function () {
    const videos = $('.js-video');

    return {
      init() {
        $('body').fitVids();
      },

      pauseAll() {

        if (videos.length) {
          videos.vimeo('pause');
        }
      },
    };
  }());


  // Name: Preloader
  // Dependencies: queryloader2.js
  // Docs: https://github.com/Gaya/queryloader2
  $('body').queryLoader2({
    backgroundColor: '#ececed',
    barColor: '#f56e4e',
    barHeight: 2,
    minimumTime: 800,
    percentage: true,
    fadeOutTime: 250,
    onComplete() {
      ExperienceSlider.init();
      Accordion.init();
      Menu.init();
      Portfolio.init();
      CircleProgress.init();
      Testimonials.init();
      Video.init();
      Tiles.init();
    },
  });


}(jQuery));
