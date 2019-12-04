// Aqui nós carregamos o gulp e os plugins através da função `require` do nodejs
const gulp = require('gulp');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const count = require('gulp-count');
const less = require('gulp-less');
const path = require('path');
const cleanCSS = require('gulp-clean-css');

const files = [
  'js/dev/libs/jquery.min.js',
  'node_modules/particles.js/particles.js',
  'js/dev/libs/plugins/*.js',
  'js/dev/modules.js',
];
const lessFiles = ['./less/style.less', './less/**/*.css', './less/custom.less'];

// Aqui criamos uma nova tarefa através do ´gulp.task´ e damos a ela o nome 'lint'
gulp.task('lint', () => {
  // Aqui carregamos os arquivos que a gente quer rodar as tarefas com o `gulp.src`
  // E logo depois usamos o `pipe` para rodar a tarefa `jshint`
  gulp.src(files)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Criamos outra tarefa com o nome 'dist'
gulp.task('dist', () => {
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

gulp.task('less', () => gulp.src(lessFiles)
  .pipe(less({
    javascriptEnabled: true,
    paths: [path.join(__dirname, 'less', 'includes')],
  }))
  .pipe(count('## less-files selected'))
  .pipe(cleanCSS({ compatibility: 'ie8' }))
  .pipe(concat('style.min.css'))
  .pipe(gulp.dest('./dist/css')));

gulp.task('watch', () => {
  // Usamos o `gulp.run` para rodar as tarefas
  gulp.run('dist');
  gulp.run('less');
  // Usamos o `gulp.watch` para o Gulp esperar mudanças nos arquivos para rodar novamente
  gulp.watch(files, (evt) => {
    gulp.run('dist');
  });
  gulp.watch(lessFiles, (evt) => {
    gulp.run('less');
  });
});

// Criamos uma tarefa 'default' que vai rodar quando rodamos `gulp` no projeto
gulp.task('default', () => {
  // Usamos o `gulp.run` para rodar as tarefas
  gulp.run('dist', 'less');
});
