var gulp = require('gulp'),
    livereload = require('gulp-livereload');

gulp.task('html', function(done){
  gulp.src('src/*.html')
    .pipe(gulp.dest('public'))
    .pipe(livereload());
    done();
});

gulp.task('css', function(done){
  gulp.src('src/*.css')
    .pipe(gulp.dest('public'))
    .pipe(livereload());
    done();
});

gulp.task('js', function(done){
  gulp.src('src/*.js')
    .pipe(gulp.dest('public'))
    .pipe(livereload());
    done();
});

gulp.task('png', function(done){
  gulp.src('src/*.png', 'src/*.jpg')
    .pipe(gulp.dest('public'))
    .pipe(livereload());
    done();
});


gulp.task('watch', function(){
  livereload.listen();
  gulp.watch('src/*.css', gulp.series('css'));
  gulp.watch('src/*.html', gulp.series('html'));
  gulp.watch('src/*.js', gulp.series('js'));
});

gulp.task('default', gulp.parallel('watch'));

