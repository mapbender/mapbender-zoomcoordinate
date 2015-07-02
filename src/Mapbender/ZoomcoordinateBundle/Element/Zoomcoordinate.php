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
        return "Zoomcoordinate"; # TODO "mb.alkis.alkis_search.class.title";
    }

    /**
     * @inheritdoc
     */
    static public function getClassDescription()
    {
        return "Zoomcoordinate Description"; # TODO "mb.alkis.alkis_search.class.description";
    }

    /**
     * @inheritdoc
     */
    static public function getClassTags()
    {
        return array(); # TODO array('mb.alkis.alkis_search.tag.search');
    }

    /**
     * @inheritdoc
     */
    public static function getDefaultConfiguration()
    {
        return array(
            'title' => 'search',
            'koordinatensystem' => array(),
            'tooltip' => 'search',
            'buffer' => 0.5,
            'options' => array(),
//            'dataSrs' => null, set srsData from Solr configuration (parameters.yml)
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
        return 'mapbender.mbAlkisSearchXY';
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
