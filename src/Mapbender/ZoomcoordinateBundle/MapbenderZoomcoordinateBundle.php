<?php

namespace Mapbender\ZoomcoordinateBundle;

use Mapbender\CoreBundle\Component\MapbenderBundle;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Mapbender\CoreBundle\DependencyInjection\Compiler\MapbenderYamlCompilerPass;

class MapbenderZoomcoordinateBundle extends MapbenderBundle
{   
    
        /**
     * @inheritdoc
     */
    public function getTemplates()
    {
        return array();
    }
    
    /**
     * @inheritdoc
     */
    public function getElements()
    {
        return array(
            'Mapbender\ZoomcoordinateBundle\Element\Zoomcoordinate'
        );
    }
    
}
