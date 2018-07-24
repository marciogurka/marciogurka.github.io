// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
const gulp = require('gulp');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const count = require('gulp-count');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const htmlmin = require('gulp-htmlmin');
const inlineCss = require('gulp-inline-css');
const less = require('gulp-less');
const path = require('path');
const cleanCSS = require('gulp-clean-css');

const files = [
    'js/dev/libs/jquery.min.js',
    'node_modules/particles.js/particles.js',
    'js/dev/libs/plugins/*.js',
    'js/dev/modules.js'
    ];
const lessFiles = ['./less/style.less', './less/**/*.css'];
const imagesPath = ['images/*', 'images/works/*'];

//Aqui criamos uma nova tarefa através do ´gulp.task´ e damos a ela o nome 'lint'
gulp.task('lint', function() {
	// Aqui carregamos os arquivos que a gente quer rodar as tarefas com o `gulp.src`
	// E logo depois usamos o `pipe` para rodar a tarefa `jshint`
	gulp.src(files)
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

//Criamos outra tarefa com o nome 'dist'
gulp.task('dist', function() {

	// Carregamos os arquivos novamente
	// E rodamos uma tarefa para concatenação
	// Renomeamos o arquivo que sera minificado e logo depois o minificamos com o `uglify`
	// E pra terminar usamos o `gulp.dest` para colocar os arquivos concatenados e minificados na pasta build/
	gulp.src(files)
	.pipe(count('## js-files selected'))
	.pipe(concat('./dist/js'))
	.pipe(rename('all.min.js'))
	.pipe(gulp.dest('./dist/js'));
});

//Otimizando as imagens
gulp.task('optimizeImg', function() {
    return gulp.src(imagesPath)
        .pipe(imagemin({
            progressive: false,
            optimizationLevel: 7,
            use: [pngquant({quality: '50', speed: 6})],
            use: [imageminWebp({quality: 50})]
        }))
        .pipe(gulp.dest('dist/images/'));
});

// Otimizando o HTML 
gulp.task('optimizeHtml', function () {
	return gulp.src('./indexSrc.html')
    .pipe(htmlmin({
    	collapseWhitespace: true,
    	minifyJS: true,
    	minifyCSS: true,
    	removeComments: true,
    }))
    .pipe(rename({basename: "index"}))
    .pipe(gulp.dest('./'));
});

gulp.task('less', function () {
  return gulp.src(lessFiles)
    .pipe(less({
        javascriptEnabled: true,
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function () {
    // Usamos o `gulp.run` para rodar as tarefas
    gulp.run('dist');
    // Usamos o `gulp.watch` para o Gulp esperar mudanças nos arquivos para rodar novamente
    gulp.watch(files, function(evt) {
        gulp.run('dist');
    });
});

//Criamos uma tarefa 'default' que vai rodar quando rodamos `gulp` no projeto
gulp.task('default', function() {
	// Usamos o `gulp.run` para rodar as tarefas
	gulp.run('dist', 'less', 'optimizeImg', 'optimizeHtml');
});