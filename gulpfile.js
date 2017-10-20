// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var count = require('gulp-count');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var imageminWebp = require('imagemin-webp');

// Definimos o diretorio dos arquivos para evitar repetição futuramente
var files = [
"./js/jquery-2.1.3.min.js",
"./js/plugins.js",
"./js/main.js",
"./node_modules/typed.js/lib/typed.js",
"./assets/js/jquery.shuffle.min.js",
"./assets/js/jquery.magnific-popup.min.js",
"./assets/js/jquery.fitvids.js",
"./assets/js/scripts.js"
];

var imagesPath = ['images/*', 'images/works/*'];

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
	.pipe(concat('./dist'))
	.pipe(rename('dist.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./dist'));
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


//Criamos uma tarefa 'default' que vai rodar quando rodamos `gulp` no projeto
gulp.task('default', function() {
	// Usamos o `gulp.run` para rodar as tarefas
	// E usamos o `gulp.watch` para o Gulp esperar mudanças nos arquivos para rodar novamente
	gulp.run('dist', 'optimizeImg');
	gulp.watch(files, function(evt) {
		gulp.run('dist', 'optimizeImg');
	});
});