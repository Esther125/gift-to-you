class HomeController {
    async index(req, res) {
        console.log('----HomeController.index');
        res.status(200).json({ message: 'Welcome!' });
    }
}

export default HomeController;
