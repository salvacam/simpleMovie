/*global _: false, Backbone: false */
var URLBACK = "https://featherbrained-exec.000webhostapp.com/simpleMovieBack/";

var Director = Backbone.Model.extend({        
    initialize: function () {
        this.movies = new Movies([], { director: this });
    }    
});
var Directors = Backbone.Collection.extend({
    model: Director,
    url: URLBACK,
    create: function(directorAttrs){
        var director = new Director(directorAttrs);
        var data = JSON.stringify({name: director.get('name'), nationality: director.get('nationality')});        
        var that = this;        
        //TODO error en post 
        $.post(URLBACK, data, function(result){            
            that.reset(result);
            postRouter.navigate("/", { trigger: true });
        });
    }
});

var DirectorListView = Backbone.View.extend({
    tagName: "li",
    className: "list-group-item",
    template: _.template("<a href='/director/<%= id %>'><%= name %></a>"),
    render: function () {
        this.el.innerHTML = this.template(this.model.toJSON());
        return this;
    }
});

var DirectorsListView = Backbone.View.extend({
    render: function () {
        var that = this;
        this.collection.forEach(function (director) {
            that.el.append(new DirectorListView({
                model: director
            }).render().el);
        });
        this.$el.prepend('<a href="/director/new">New Directors</a>');
        return this;
    },
    events: {
        'click a': 'handleClick'
    },
    handleClick: function (e) {
        e.preventDefault();
        postRouter.navigate($(e.currentTarget).attr("href"),{trigger: true});
    }
});

var DirectorView = Backbone.View.extend({
    template: _.template($("#directorTemplate").html()),
    events: {
        'click a': 'handleClick'
    },
    render: function () {
        this.el.innerHTML = this.template(this.model.toJSON());
        return this;        
    },
    handleClick: function (e) {
        e.preventDefault();
        postRouter.navigate($(e.currentTarget).attr("href"), {trigger: true});
    }
});

var DirectorFormView = Backbone.View.extend({
    tagName: 'form',
    template: _.template($("#directorFormTemplate").html()),
    initialize: function (options) {
        this.directors = options.directors;
    },
    events: {
        'click button': 'createDirector',
        'click a': 'handleClick'
    },
    handleClick: function (e) {
        e.preventDefault();
        postRouter.navigate($(e.currentTarget).attr("href"),{trigger: true});
    },
    render: function () {
        this.el.innerHTML = this.template();
        return this;
    },
    createDirector: function (e) {
        var newId = _.max(this.directors.toJSON(), function(item){
            return item.id;
        });
        var directorAttrs = {
            name: $("#directorName").val(),
            nationality: $("#directorNationality").val(),
            id: newId.id + 1
        };
        this.directors.create(directorAttrs);
        return false;
    }
});

var Movie = Backbone.Model.extend({});
var Movies = Backbone.Collection.extend({
    initialize: function (models, options) {
        this.director = options.director;
    },
    url: function () {
        return this.director.url();
    }
});

var MovieView = Backbone.View.extend({
    template: _.template($("#movieView").html()),
    render: function () {
        var model = this.model.toJSON();
        this.el.innerHTML = this.template(model);
        return this;
    }
});

var MoviesView = Backbone.View.extend({
    initialize: function (options) {
        this.director = options.director;
        //this.director.movies.fetch();
        this.director.movies.on('add', this.addMovie, this);
    },    
    addMovie: function (movie) {
        this.$el.append(new MovieView({
            model: movie
        }).render().el);
    },    
    render: function () {
        this.$el.append("<h4> Movies </h4>");
        
        this.director.movies.fetch({
            reset: true,                
            success: renderMovies
        });       
        
        var that = this;
        function renderMovies(){
            that.director.movies.forEach(function (movie) {
                that.$el.append(new MovieView({
                    model: movie
                }).render().el);
            });
        }
        this.$el.append(new MovieFormView({
            director: this.director
        }).render().el);
        return this;
    }
});

var MovieFormView = Backbone.View.extend({
    tagName: "form",
    initialize: function (options) {
        this.director = options.director;
    },
    template: _.template($("#movieFormView").html()),
    events: {
        'click button': 'submitMovie'
    },
    render: function () {
        this.el.innerHTML = this.template();
        return this;
    },
    submitMovie: function (e) {
        var movie = this.$("#movieName").val();
        var year = this.$("#movieYear").val();
        var movieAttrs = {
            directorId: this.director.get("id"),
            movie: movie,
            year: year
        };
        
        this.director.movies.create(movieAttrs);
        this.el.reset();
    }
});

var PostRouter = Backbone.Router.extend({
    initialize: function (options) {
        this.directors = options.directors;
    },
    routes: {
        '': 'index',
        'director/new': 'newDirector',
        'director/:id': 'singleDirector'        
    },
    index: function () {
        var dv = new DirectorsListView({ collection: this.directors });
        $('#main-director').html('');
        $('#list-directors').html(dv.render().el);
    },
    singleDirector: function (id) {
        var director = this.directors.get(id);
        var dv = new DirectorView({ model: director });
        $('#list-directors').html('');
        $('#main-director').html(dv.render().el);
        
        var mv = new MoviesView({director: director});
        $('#main-director').append(mv.render().el);
    },
    newDirector: function() {
        console.log('newDirector route');
        var dfv = new DirectorFormView({ directors: this.directors });
        $('#list-directors').html('');
        $('#main-director').html(dfv.render().el);
    }
});
 
 
//TODO error al cargar los datos
var postRouter;
$.get(URLBACK, function(data, status){
    postRouter = new PostRouter({
        directors: new Directors(data)//,
        //listElement: $('#list-directors')
    });
    
    Backbone.history.start({root: "/simpleMovie/"});
});