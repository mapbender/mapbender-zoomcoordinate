<?php

namespace Mapbender\AlkisBundle\Element;

use Mapbender\CoreBundle\Component\Element;
use Symfony\Component\HttpFoundation\Response;
use ARP\SolrClient2\SolrClient;

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
        return "AlkisSucheXY Description"; # TODO "mb.alkis.alkis_search.class.description";
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
        $solr = $this->container->getParameter('solr');
        $configuration['dataSrs'] = $solr['srs'];
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
        return 'MapbenderZoomcoordinateBundle:ElementAdmin:zoomcoordinate.html.twig';
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
                '@MapbenderAlkisBundle/Resources/public/sass/element/mapbender.element.alkissearchxy.scss')
        );
    }

    /**
     * @inheritdoc
     */
    public function render()
    {
        return $this->container->get('templating')
                ->render(
                    'MapbenderAlkisBundle:Element:alkissearchxy.html.twig',
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

    protected function search()
    {
        $term = $this->container->get('request')->get("term", null);
        $page = $this->container->get('request')->get("page", 1);
        $type = $this->container->get('request')->get("type", 'flur');

        $solr = new SolrClient(
            $this->container->getParameter('solr')
        );
        // Suche
        $result = $solr
            ->wildcardMinStrlen(1)
            ->page($page)
            ->where('type', $type)
            ->find($term);
        // Übergabe an Template
        $html = $this->container->get('templating')->render(
            'MapbenderAlkisBundle:Element:results.html.twig', array('result' => $result)
        );
        return new Response($html, 200, array('Content-Type' => 'text/html'));
    }

}
