<?php

namespace Mapbender\ZoomcoordinateBundle\Element;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Description of SearchAdminType
 *
 * @author Paul Schmidt
 */
class ZoomcoordinateAdminType extends AbstractType
{

    /**
     * @inheritdoc
     */
    public function getName()
    {
        return 'zoomcoordinate';
    }

    /**
     * @inheritdoc
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'application' => null
        ));
    }

    /**
     * @inheritdoc
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', 'text', array('required' => false))
            ->add('prefix_projection', 'text', array('required' => false))
            ->add('prefix_x', 'text', array('required' => false))
            ->add('prefix_y', 'text', array('required' => false))
            ->add('type', 'choice', array(
                'required' => true,
                'choices' => array(
                    'element' => 'Element',
                    'dialog' => 'Dialog')))
            ->add('target', 'target_element',
                array(
                'element_class' => 'Mapbender\\CoreBundle\\Element\\Map',
                'application' => $options['application'],
                'property_path' => '[target]',
                'required' => false));
            
    }

}

?>
