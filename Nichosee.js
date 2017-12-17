function GetFormatDate(date)
{
	var date = new Date(date);
	return date.getDate() + '.' + (date.getMonth() + 1) + '.' +  date.getFullYear();
}
	
function GetTranslateGenres(genres)
{
	genres = genres.split(",");
		
	genres.forEach(function(genre, index) 
	 {
		 switch(genres[index].trim()) {
			case 'Comedy':
			 {	
				genres[index]="Комедия";
				break;
			 }
			case 'Drama':
			 {
				genres[index]="Драма";
				break;
			 }
			case 'Action':
			 {
				genres[index]="Боевик";
				break;
			 }
			case 'Adventure':
			 {
				genres[index]="Приключения";
				break;
			 }
			case 'Thriller':
			 {
				genres[index]="Триллер";
				break;
			 }
			case 'Romance':
			 {
				genres[index]="Мелодрама";
				break;
			 }
			case 'Crime':
			 {
				genres[index]="Криминал";
				break;
			 }
			case 'Horror':
			 {
				genres[index]="Ужасы";
				break;
			 }
			case 'Biography':
			 {
				genres[index]="Биография";
				break;
			 }
			case 'Mystery':
			 {
				genres[index]="Мистика";
				break;
			 }
			case 'Sci-Fi':
			 {
				genres[index]="Фантастика";
				break;
			 }
			case 'Fantasy':
			 {
				genres[index]="Фэнтези";
				break;
			 }
			case 'History':
			 {
				genres[index]="Исторический";
				break;
			 }
			case 'Family':
			 {
				genres[index]="Семейный";
				break;
			 }
			case 'Animation':
			 {
				genres[index]="Мультфильмы";
				break;
			 }
			case 'Music':
			 {
				genres[index]="Мюзикл";
				break;
			 }
			case 'Sport':
			 {
				genres[index]="Спорт";
				break;
			 }
			case 'War':
			 {
				genres[index]="Военный";
				break;
			 }
			case 'Western':
			 {
				genres[index]="Вестерн";
				break;
			 }
			case 'N/A':
			 {
				genres[index]="Не указан";
				break;
			 }
			case 'Documentary':
			 {
				genres[index]="Документальный";
				break;
			 }
		 }
	 });
	 
	return genres.join(", ");
	
}
	
function items(page, NumPage, haveMore, NewNumPage)
{
	if (haveMore)
	{
		setTimeout(function()
		{		
			var items = JSON.parse(showtime.httpReq("https://nichosee.com/archive/?type=json&page="+NumPage));
						
			items.forEach(function(item) {
				
				 page.appendItem(plugin.getDescriptor().id +":video:"+item.imdb_id, "video", 
					 {
						 title: item.title_ru,
						 icon: "https://nichosee.com"+item.poster,
						 logo: "https://nichosee.com"+item.poster,
						 description: "Год выпуска: "+item.year
									 +"\nДата публикации: "+GetFormatDate(item.pub_date)
									 +"\nОценка IMDB: "+item.imdb_rating
									 +"\nЖанр: "+GetTranslateGenres(item.genre)
					 });
			});
							
			NewNumPage(NumPage+1);
		}, 1750);
	}
}

(function(plugin) {
    var logo = plugin.path + "logo.png";

    var service = plugin.createService(plugin.getDescriptor().title, plugin.getDescriptor().id + ":start","video", true, logo);	
	
	function setPageHeader(page, title) 
	{
		if (page.metadata) 
		{
			page.metadata.title = title;
			page.metadata.logo = logo;
		}
		page.type = "directory";
		page.contents = "items";
		page.loading = false;
	}

	plugin.addURI(plugin.getDescriptor().id + ":start", function (page) 
	{     
		setPageHeader(page, "Меню");
	
		page.appendItem("", "directory", 
		 {
			 title: "Популярное"
		 });
		page.appendItem("", "directory", 
		 {
			 title: "Жанры"
		 });

		page.appendItem(plugin.getDescriptor().id + ":archive", "directory", 
		 {
			 title: "Архив"
		 });	
	});
	
	plugin.addURI(plugin.getDescriptor().id + ":archive", function (page) 
	{     
		setPageHeader(page, "Архив");
		
		//var post = new Object();
		//post.genres=['Music'];
			    
		var Numpage=1;
		var haveMore=true;

		(page.asyncPaginator = function loader() 
			{
				items(page, Numpage, haveMore, function(newPage)
				{
					Numpage=newPage;
					page.haveMore(haveMore);
				});
			})();
	});	
	
	plugin.addURI(plugin.getDescriptor().id + ":video:(.*)", function(page, id) 
	{
		var film = JSON.parse(showtime.httpReq("https://nichosee.com/"+id+"?type=json"));

		setPageHeader(page,film.title_ru);			
		
		film.releases.forEach(function(release) {
			page.appendItem("torrent:browse:https://nichosee.com/download.php?rt="+release.rutor_id, "video", 
				 {
					 title: release.rip_type+" "+release.vq+" ("+release.size+")",
					 icon: "https://nichosee.com"+film.poster,
					 logo: "https://nichosee.com"+film.poster,
					 description: release.title_full
				 });								
		});
	});		
	
})(this);