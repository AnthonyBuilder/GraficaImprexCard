const gulp = require('gulp')

gulp.task('compress', function () {
    gulp.src(['../*.js'])
        .pipe(minify())
        .pipe(gulp.dest('/lib/app.mjs'))
});