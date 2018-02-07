const genresConst = {
    'Biography': 'Биография',
    'Western': 'Вестерн',
    'War': 'Военный',
    'Documentary': 'Документальный',
    'Drama': 'Драма',
    'History': 'Исторический',
    'Comedy': 'Комедия',
    'Crime': 'Криминал',
    'Romance': 'Мелодрама',
    'Mystery': 'Мистика',
    'Music': 'Музыкальный',
    'Animation': 'Мультфильмы',
    'Adventure': 'Приключения',
    'Family': 'Семейный',
    'Sport': 'Спорт',
    'Thriller': 'Триллер',
    'Horror': 'Ужасы',
    'Sci-Fi': 'Фантастика',
    'Fantasy': 'Фэнтези',
    'Action': 'Экшн',
    'N/A': 'Жанр не указан'
}

function GetFormatDate(date) {
    var date = new Date(date);
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
}

function GetTranslateGenres(genres) {
    genres = genres.split(",");

    genres.forEach(function (genre, index) {
        genres[index] = genresConst[genres[index].trim()];
    });

    return genres.join(", ");
}

function GetPopular(page) {
    var link = "https://nichosee.com/?type=json";

    var items = JSON.parse(showtime.httpReq(link));

    items.forEach(function (item) {
        PrintLabelCinema(page, item);
    });
}

function PrintLabelCinema(page, film) {
    page.appendItem(plugin.getDescriptor().id + ":video:" + film.imdb_id, "video",
        {
            title: film.title_ru,
            icon: "https://nichosee.com" + film.poster,
            logo: "https://nichosee.com" + film.poster,
            description: "Год выпуска: " + film.year
                + "\nДата публикации: " + GetFormatDate(film.pub_date)
                + "\nОценка IMDB: " + film.imdb_rating
                + "\nЖанр: " + GetTranslateGenres(film.genre)
        });
}

function GetItems(page, NumPage, haveMore, NewNumPage, genre) {

    if (haveMore) {
        setTimeout(function () {
            var link = "https://nichosee.com/archive/?type=json&page=" + NumPage;

            var postGenre;

            if (genre != undefined) {
                postGenre = genre;
            }
            else {
                postGenre = "";
            }

            var items = JSON.parse(showtime.httpReq(link, {
                postdata: { 'genres[]': postGenre },
            }));

            items.forEach(function (item) {

                PrintLabelCinema(page, item);
            });

            NewNumPage(NumPage + 1);
        }, 1750);
    }
}

function AsyncPaginator(page, genre) {
    var numPage = 1;
    var haveMore = true;

    (page.asyncPaginator = function loader() {
        GetItems(page, numPage, haveMore, function (newPage) {
            numPage = newPage;
            page.haveMore(haveMore);
        }, genre);
    })();
}

(function (plugin) {
    var logo = plugin.path + "logo.png";

    var service = plugin.createService(plugin.getDescriptor().title, plugin.getDescriptor().id + ":start", "video", true, logo);

    function setPageHeader(page, title) {
        if (page.metadata) {
            page.metadata.title = title;
            page.metadata.logo = logo;
        }
        page.type = "directory";
        page.contents = "items";
        page.loading = false;
    }

    plugin.addURI(plugin.getDescriptor().id + ":start", function (page) {
        setPageHeader(page, "Меню");

        page.appendItem(plugin.getDescriptor().id + ":popular", "directory",
            {
                title: "Популярное"
            });
        page.appendItem(plugin.getDescriptor().id + ":genres", "directory",
            {
                title: "Жанры"
            });

        page.appendItem(plugin.getDescriptor().id + ":archive:Архив:", "directory",
            {
                title: "Архив"
            });
    });

    plugin.addURI(plugin.getDescriptor().id + ":genres", function (page) {
        setPageHeader(page, "Жанры");

        for (var genre in genresConst) {
            page.appendItem(plugin.getDescriptor().id + ":archive:" + genresConst[genre] + ":" + genre, "directory",
                {
                    title: genresConst[genre]
                });
        }

    });

    plugin.addURI(plugin.getDescriptor().id + ":popular", function (page) {
        setPageHeader(page, "Популярное");
        GetPopular(page);
    });

    plugin.addURI(plugin.getDescriptor().id + ":archive:(.*):(.*)", function (page, header, genre) {

        setPageHeader(page, header);

        AsyncPaginator(page, genre);

    });

    plugin.addURI(plugin.getDescriptor().id + ":video:(.*)", function (page, id) {

        var film = JSON.parse(showtime.httpReq("https://nichosee.com/" + id + "?type=json"));

        setPageHeader(page, film.title_ru);

        film.releases.forEach(function (release) {
            page.appendItem("torrent:browse:https://nichosee.com/download.php?rt=" + release.rutor_id, "video",
                {
                    title: release.rip_type + " " + release.vq + " (" + release.size + ")",
                    icon: "https://nichosee.com" + film.poster,
                    logo: "https://nichosee.com" + film.poster,
                    description: release.title_full
                });
        });
    });

})(this);