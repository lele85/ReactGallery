/** @jsx React.DOM */
(function($){
	

	var GalleryImage = React.createClass({
		render : function(){
			return (
				<img src={this.props.path} />
			);
		}
	});

	var Gallery = React.createClass({
		render : function(){
			var that =  this;
			var imageNodes = Object.keys(that.props.data.images).map(function (path, index) {
				var activeClass = (that.props.data.active === index) ? "active" : "";
	  			return (
	  				<li className={'galleryImage ' + activeClass}><GalleryImage path={path}></GalleryImage></li>
	  			);
			});
			
			return (
					<ul>{imageNodes}</ul>
			);
		}
	});

	var GalleryWithControls = React.createClass({
		getInitialState: function(){
			var sock = new SockJS('http://127.0.0.1:8000/filestatus');
			var images = {};
			var updateGallery = function(message){
				if (message.type === 'add'){
					images[message.path] = message;
				}
				if (message.type === 'unlink'){
					delete images[message.path];
				}
			};

			var that =  this;
	   		sock.onopen = function() {};
			sock.onmessage = function(e) {
				updateGallery(JSON.parse(e.data));
				that.setState(
					{
						images : images,
						active : 0
					});
			};
			sock.onclose = function() {};

			return {
				images : images,
				active : -1
			}
		},
		handleNext : function(){
			this.state.active = (this.state.active + 1) % Object.keys(this.state.images).length;
			this.setState(this.state);
		},
		handlePrev : function(){
			this.state.active =  (this.state.active - 1);
			if (this.state.active === -1 ) { this.state.active = Object.keys(this.state.images).length - 1;}
			this.setState(this.state);

		},
		render : function(){
			return (
				<div>
					<Gallery data={this.state}/>
					<p onClick={this.handleNext} className="galleryButton next"></p>
					<p onClick={this.handlePrev} className="galleryButton prev"></p>
				</div>
			)
		}
	});


	React.renderComponent(
	  <GalleryWithControls />,
	  document.getElementById('gallery')
	);
}(jQuery));
