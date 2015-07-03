<?php

namespace Mapbender\ZoomcoordinateBundle\Element;

use Mapbender\CoreBundle\Component\Element;
use Symfony\Component\HttpFoundation\Response;

class Zoomcoordinate extends Element
{

    /**
     * @inheritdoc
     */
    static public function getClassTitle()
    {
        return "Zoomcoordinate"; 
    }

    /**
     * @inheritdoc
     */
    static public function getClassDescription()
    {
        return "Zoom to a coordinate"; 
    }

    /**
     * @inheritdoc
     */
    static public function getClassTags()
    {
        return array(); 
    }

    /**
     * @inheritdoc
     */
    public static function getDefaultConfiguration()
    {
        return array(
            'title' => 'Zoom to Coordinate',
            'prefix_projection' => 'Projection',
            'prefix_x' => 'x',
            'prefix_y' => 'y',
            'type' => null,
            'target' => null,
        );
    }

    /**
     * @inheritdoc
     */
    public function getConfiguration()
    {
        $configuration = parent::getConfiguration();
        return $configuration;
    }

    /**
     * @inheritdoc
     */
    public function getWidgetName()
    {
        return 'mapbender.mbZoomcoordinate';
    }

    /**
     * @inheritdoc
     */
    public static function getType()
    {
        return 'Mapbender\ZoomcoordinateBundle\Element\ZoomcoordinateAdminType';
    }

    /**
     * @inheritdoc
     */
    public static function getFormTemplate()
    {
        return 'MapbenderZoomcoordinateBundle::zoomcoordinateAdmin.html.twig';
    }

    /**
     * @inheritdoc
     */
    public function getAssets()
    {
        return array(
            'js' => array('mapbender.element.zoomcoordinate.js',
                '@FOMCoreBundle/Resources/public/js/widgets/popup.js'),
            'css' => array(
                '@MapbenderZoomcoordinateBundle/Resources/public/sass/element/mapbender.element.zoomcoordinate.scss')
        );
    }

    /**
     * @inheritdoc
     */
    public function render()
    {
        return $this->container->get('templating')
                ->render(
                    'MapbenderZoomcoordinateBundle::zoomcoordinate.html.twig',
                    array(
                    'id' => $this->getId(),
                    'title' => $this->getTitle(),
                    'configuration' => $this->getConfiguration()
                    )
        );
    }

    /**
     * @inheritdoc
     */
    public function httpAction($action)
    {
        switch ($action) {
            case 'search':
                return $this->search();
            default:
                throw new NotFoundHttpException('No such action');
        }
    }

    

}
